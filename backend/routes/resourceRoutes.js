// backend/routes/resourceRoutes.js
const express = require('express');
const auth = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');
const Resource = require('../models/Resource');
const Group = require('../models/Group');

const router = express.Router();

/**
 * Create resource (owner is req.user). If groupId provided, resource belongs to group and only group members/owner can access.
 * Only admin & faculty can create general resources (example), but students could create personal resources if you want.
 */
router.post('/', auth, requireRole('admin', 'faculty'), async (req, res) => {
  try {
    const { title, content, groupId } = req.body;

    if (groupId) {
      const group = await Group.findById(groupId);
      if (!group) return res.status(404).json({ message: 'Group not found' });

      // only members can post to group
      // Note: req.user._id is a MongoDB ObjectId. group.members contains ObjectIds.
      const isMember = group.members.some(m => m.toString() === req.user._id.toString());
      if (!isMember) return res.status(403).json({ message: 'You are not a member of this group' });
    }

    const resource = await Resource.create({
      title,
      content,
      owner: req.user._id,
      group: groupId || null
    });
    res.status(201).json(resource);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Get resources owned by me (personal + group resources where owner==me)
 */
router.get('/mine', auth, async (req, res) => {
  try {
    const list = await Resource.find({ owner: req.user._id }).sort('-createdAt');
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Get resources visible to me:
 * - personal resources where owner==me
 * - resources with group in my joined groups
 */
router.get('/visible', auth, async (req, res) => {
  try {
    // find groups where I'm member
    const groups = await Group.find({ members: req.user._id }).select('_id');
    const groupIds = groups.map(g => g._id);

    const list = await Resource.find({
      $or: [
        { owner: req.user._id },
        { group: { $in: groupIds } }
      ]
    }).sort('-createdAt');

    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Get single resource — allow only owner OR if resource.group => only group members
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const r = await Resource.findById(req.params.id).populate('group');
    if (!r) return res.status(404).json({ message: 'Not found' });

    // Check 1: Is the current user the owner?
    if (r.owner.toString() === req.user._id.toString()) return res.json(r);

    // Check 2: If it belongs to a group, is the user a member of that group?
    if (r.group) {
      // Since r is populated, r.group is a populated Group document.
      // Check for membership in the populated group object (r.group)
      const isMember = r.group.members.some(m => m.toString() === req.user._id.toString());
      if (!isMember) return res.status(403).json({ message: 'Forbidden: Not a member of the required group' });
      return res.json(r);
    }

    // Check 3: If neither the owner nor a group member, it's forbidden.
    return res.status(403).json({ message: 'Forbidden: Resource is private' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Update / Delete — only owner
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const r = await Resource.findById(req.params.id);
    if (!r) return res.status(404).json({ message: 'Not found' });
    if (r.owner.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Forbidden: Only owner can modify' });

    r.title = req.body.title ?? r.title;
    r.content = req.body.content ?? r.content;
    await r.save();
    res.json(r);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const r = await Resource.findById(req.params.id);
    if (!r) return res.status(404).json({ message: 'Not found' });
    if (r.owner.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Forbidden: Only owner can delete' });

    // Use deleteOne() or findByIdAndDelete() for Mongoose 6+ compatibility
    await r.deleteOne(); 
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;