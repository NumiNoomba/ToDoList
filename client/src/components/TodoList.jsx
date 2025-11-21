import React, { useState } from 'react'
import { List, Button, Input, Pagination, Select, Modal, Form, Row, Col, Tag, message } from 'antd'
import { useTodos } from '../context/TodoContext'
import * as api from '../api'

const { Search } = Input

export default function TodoList(){
  const { todos, load, page, setPage, pageSize, total, categories, loadCategories, search, setSearch } = useTodos()
  const [editing, setEditing] = useState(null)
  const [form] = Form.useForm()

  const openEdit = (todo) => { setEditing(todo); form.setFieldsValue({ title: todo.title, description: todo.description, categoryId: todo.categoryId }); }

  const onFinish = async (vals) => {
    // normalize categoryId
    if (vals.categoryId === '') vals.categoryId = null;
    try {
      if (editing && editing.id) {
        await api.updateTodo(editing.id, vals);
        message.success('Todo updated');
      } else {
        await api.createTodo(vals);
        message.success('Todo created');
      }
      setEditing(null);
      form.resetFields();
      await load();
    } catch (err) {
      console.error(err);
      const text = err?.response?.data?.error || err.message || 'Save failed';
      message.error(text);
    }
  }

  return (
    <div>
      <Row gutter={8} style={{ marginBottom: 12 }}>
        <Col flex={1}><Search value={search} placeholder="Search by title" allowClear enterButton onSearch={(v)=>{ setPage(1); setSearch(v); }} /></Col>
        <Col><Button type="primary" onClick={()=>{ setEditing({}); form.resetFields(); }}>New Todo</Button></Col>
      </Row>

      <List dataSource={todos} renderItem={item=> (
        <List.Item actions={[
          <Button key="edit" onClick={()=>openEdit(item)}>Edit</Button>,
          <Button key="del" danger onClick={async ()=>{ if(confirm('Delete?')){ await api.deleteTodo(item.id); load(); } }}>Delete</Button>
        ]}>
          <List.Item.Meta title={<div><strong>{item.title}</strong> {item.Category && <Tag>{item.Category.name}</Tag>}</div>} description={item.description} />
          <div>
            <Button onClick={async ()=>{ await api.toggleTodo(item.id); load(); }}>{item.completed? 'Mark Incomplete' : 'Mark Complete'}</Button>
          </div>
        </List.Item>
      )} />

      <Pagination current={page} pageSize={pageSize} total={total} onChange={(p)=>setPage(p)} style={{ marginTop: 12 }} />

      <Modal open={!!editing} title={editing && editing.id ? 'Edit Todo' : 'New Todo'} onCancel={()=>setEditing(null)} footer={null}>
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ categoryId: '' }}>
          <Form.Item name="title" label="Title" rules={[{ required:true, message:'Title required' }]}><Input/></Form.Item>
          <Form.Item name="description" label="Description"><Input/></Form.Item>
          <Form.Item name="categoryId" label="Category"><Select allowClear options={categories.map(c=>({ label:c.name, value:c.id }))} /></Form.Item>
          <Form.Item><Button type="primary" htmlType="submit">Save</Button></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
