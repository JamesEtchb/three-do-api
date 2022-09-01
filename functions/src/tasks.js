import jwt from 'jsonwebtoken'
import { secretKey } from '../credentials.js'
import dbConnect from './dbconnect.js'

export async function getTasks(req, res) {
  const token = req.headers.authorization
  const user = jwt.verify(token, secretKey)
  const db = dbConnect()
  const collection = await db
    .collection('/tasks')
    .where('userId', '==', user.id)
    //mongo 
    //.find({ 'userId': user.id })
    .get()
    .catch((err) => res.status(500).send(err))
  const tasks = collection.docs.map((doc) => {
    return { ...doc.data(), id: doc.id }
  })
  res.send(tasks)
}

export async function createTask(req, res) {
  const token = req.headers.authorization
  let newTask = req.body
  const user = jwt.verify(token, secretKey)
  if (!newTask || !newTask.task || !user) {
    res.status(400).send({ success: false, message: 'Invalid request' })
    return
  }
  newTask.userId = user.id
  const db = dbConnect()
  await db
    .collection('tasks')
    .add(newTask)
    .catch((err) => res.status(500).send(err))
  res.status(201)
  getTasks(req, res) //send back the full list of tasks
}

export async function updateTask(req, res) {
  const taskUpdate = req.body
  const { taskId } = req.params
  const db = dbConnect()
  await db
    .collection('tasks')
    .doc(taskId)
    .update(taskUpdate)
    .catch((err) => res.status(500).send(err))
  res.status(202)
  getTasks(req, res)
}

export function deleteTask(req, res) {
  const { taskId } = req.params
  res.status(203).send('Task Deleted')
}
