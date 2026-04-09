//------------------ USER CLASS ----------------------
//----------------------------------------------------------
export default class User {
  id = 0
  name = ''
  email = ''
  password = ''
  avatar = null
  avatarDecoration = null
  createdAt = new Date()
  points = 0
  priority = ''
  role = ''
  habits = []

  constructor({ id, name, email, password, avatar, avatarDecoration, createdAt, points, priority, habits = [] }) {
    this.id = id
    this.name = name
    this.email = email
    this.password = password
    this.avatar = avatar
    this.avatarDecoration = avatarDecoration || null
    this.createdAt = createdAt ? new Date(createdAt) : new Date()
    this.points = points
    this.priority = priority ? priority : 1
    this.habits = habits

    this.role = this.priority === 2 ? 'admin' : 'user'
  }
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      password: this.password,
      avatar: this.avatar,
      avatarDecoration: this.avatarDecoration,
      createdAt: this.createdAt.toISOString(),
      points: this.points,
      priority: this.priority,
      habits: this.habits,
    }
  }
}
