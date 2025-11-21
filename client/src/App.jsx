import React from 'react'
import { Layout, Row, Col, Typography } from 'antd'
import { TodoProvider } from './context/TodoContext'
import TodoList from './components/TodoList'
import CategoryManager from './components/CategoryManager'

const { Header, Content } = Layout

export default function App(){
  return (
    <TodoProvider>
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ background: '#001529' }}>
          <Typography.Title level={3} style={{ color: '#fff', margin: 0 }}>Todo App</Typography.Title>
        </Header>
        <Content style={{ padding: 16 }}>
          <Row gutter={[16,16]}>
            <Col xs={24} md={16}><TodoList /></Col>
            <Col xs={24} md={8}><CategoryManager /></Col>
          </Row>
        </Content>
      </Layout>
    </TodoProvider>
  )
}
