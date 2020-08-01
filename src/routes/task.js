const { Router } = require('express');
const taskRouter = Router();

const Task = require('../models/task');

// create a new task
taskRouter.post('/', async (req, res) => {
  try {
    const task = new Task({ ...req.body, owner: req.user._id });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json(error);
  }
});

// get all tasks by user
// GET tasks?completed=true|false
// GET tasks?limit=10&page=1
// GET tasks?sortBy=createdAt:asc|desc
taskRouter.get('/', async (req, res) => {
  try {
    const match = {};
    const sort = {};
    const { completed, limit, page, sortBy } = req.query;
    if (completed) {
      match.completed = completed === 'true';
    }

    if (sortBy) {
      const [field, order = 'asc'] = sortBy.split(':');
      sort[field] = order.toLowerCase() === 'asc' ? 1 : -1;
    }

    let skip = 0;
    if (page) {
      skip = parseInt(limit) * (page - 1);
    }
    // const tasks = await Task.find({ owner: req.user._id });
    await req.user
      .populate({
        path: 'tasks',
        match,
        options: {
          limit: parseInt(limit),
          skip,
          sort,
        },
      })
      .execPopulate();

    res.status(200).json(req.user.tasks);
  } catch (error) {
    res.status(500).json(error);
  }
});

taskRouter.get('/:id', async (req, res) => {
  try {
    const _id = req.params.id;
    const task = await Task.findOne({ _id, owner: req.user._id });

    if (!task) return res.status(404).json({ error: 'task does not exist!' });
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json(error);
  }
});

// update a task by its id
taskRouter.patch('/:id', async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdated = ['description', 'completed'];
    const isValidOperation = updates.every((update) =>
      allowedUpdated.includes(update)
    );

    if (!isValidOperation)
      return res.status(400).json({ error: 'invalid update!' });

    const _id = req.params.id;
    const newData = req.body;
    const task = await Task.findOne({ _id, owner: req.user._id });

    if (!task) return res.status(404).json({ message: 'task not found' });

    updates.forEach((update) => (task[update] = newData[update]));
    await task.save();

    res.status(200).json(task);
  } catch (error) {
    res.status(400).json(error);
  }
});

// delete a task by its id
taskRouter.delete('/:id', async (req, res) => {
  try {
    const _id = req.params.id;
    const task = await Task.findOneAndDelete({ _id, owner: req.user._id });

    if (!task) return res.status(404).json({ error: 'task not found' });

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = taskRouter;
