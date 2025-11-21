import React, { createContext, useContext, useEffect, useState } from 'react'
import * as api from '../api'

const TodoContext = createContext(null)

export const useTodos = () => useContext(TodoContext)

export function TodoProvider({ children }){
  const [todos, setTodos] = useState([])
  const [categories, setCategories] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')

  const load = async () => {
    const res = await api.fetchTodos({ page, pageSize, search })
    setTodos(res.todos)
    setTotal(res.total)
  }

  const loadCategories = async () => { const c = await api.fetchCategories(); setCategories(c); }

  useEffect(()=>{ loadCategories(); }, [])
  useEffect(()=>{ load(); }, [page, search])

  return (
    <TodoContext.Provider value={{ todos, setTodos, categories, setCategories, page, setPage, pageSize, total, search, setSearch, load, loadCategories }}>
      {children}
    </TodoContext.Provider>
  )
}
