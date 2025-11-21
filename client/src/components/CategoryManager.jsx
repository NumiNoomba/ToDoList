import React, { useState } from 'react'
import { Card, List, Button, Input, Form } from 'antd'
import { useTodos } from '../context/TodoContext'
import * as api from '../api'

export default function CategoryManager(){
  const { categories, loadCategories, load } = useTodos()
  const [name, setName] = useState('')

  const add = async ()=>{ if(!name) return; await api.createCategory(name); setName(''); await loadCategories(); await load(); }

  return (
    <Card title="Categories">
      <Form layout="inline" onFinish={add} style={{ marginBottom: 12 }}>
        <Form.Item><Input value={name} onChange={e=>setName(e.target.value)} placeholder="New category" /></Form.Item>
        <Form.Item><Button type="primary" onClick={add}>Add</Button></Form.Item>
      </Form>
      <List dataSource={categories} renderItem={c=> (
        <List.Item actions={[
          <Button key="rename" onClick={async ()=>{ const nv = prompt('New name', c.name); if(nv){ await api.updateCategory(c.id, nv); await loadCategories(); } }}>Rename</Button>,
          <Button key="del" danger onClick={async ()=>{ if(confirm('Delete?')){ await api.deleteCategory(c.id); await loadCategories(); await load(); } }}>Delete</Button>
        ]}>{c.name}</List.Item>
      )} />
    </Card>
  )
}
