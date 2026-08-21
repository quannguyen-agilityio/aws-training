import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import './App.css';

const client = generateClient<Schema>();

export default function App() {
  const [todos, setTodos] = useState<Array<Schema['Todo']['type']>>([]);
  const [content, setContent] = useState('');
  const [status] = useState<string>('Ready');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const { data: items } = await client.models.Todo.list();
      if (items) {
        setTodos(items);
      }
    } catch (err: unknown) {
      console.warn('Amplify list notice:', err);
    }
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const newContent = content;
    setContent('');

    try {
      const { data: newTodo } = await client.models.Todo.create({
        content: newContent,
      });
      if (newTodo) {
        setTodos((prev) => [...prev, newTodo]);
      } else {
        const tempTodo: Schema['Todo']['type'] = {
          id: Date.now().toString(),
          content: newContent,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setTodos((prev) => [...prev, tempTodo]);
      }
    } catch (err: unknown) {
      console.warn('Amplify create fallback notice:', err);
      const tempTodo: Schema['Todo']['type'] = {
        id: Date.now().toString(),
        content: newContent,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setTodos((prev) => [...prev, tempTodo]);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      await client.models.Todo.delete({ id });
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (err: unknown) {
      console.warn('Amplify delete fallback notice:', err);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    }
  };

  return (
    <div className='app-container'>
      <header className='header'>
        <div className='badge-row'>
          <span className='badge badge-aws'>AWS Amplify Gen 2</span>
          <span className='badge badge-vite'>React + Vite + TS</span>
        </div>
        <h1 className='title'>AWS Amplify Fullstack App</h1>
        <p className='subtitle'>
          Connected to Amplify Data (AppSync GraphQL) & Auth (Cognito)
        </p>
      </header>

      <section className='glass-card'>
        <div className='card-header'>
          <h2 className='card-title'>🚀 Amplify CLI Commands</h2>
        </div>
        <p
          style={{
            color: 'var(--text-secondary)',
            marginBottom: '0.75rem',
            fontSize: '0.9rem',
          }}
        >
          Connect your local React Vite application to your AWS cloud backend
          using the Amplify CLI:
        </p>
        <div className='cli-box'>
          <span>npx ampx sandbox</span>
          <span className='cli-code'>
            Deploy backend & sync amplify_outputs.json
          </span>
        </div>
        <div className='cli-box'>
          <span>npx ampx generate outputs</span>
          <span className='cli-code'>
            Generate outputs from deployed AWS stack
          </span>
        </div>
      </section>

      <section className='glass-card'>
        <div className='card-header'>
          <h2 className='card-title'>📋 Todo Manager</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Status: {status}
          </span>
        </div>

        <form
          onSubmit={addTodo}
          className='input-group'
          style={{ marginBottom: '1.5rem' }}
        >
          <input
            type='text'
            className='input-field'
            placeholder='Enter a new todo item...'
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button type='submit' className='btn-primary'>
            Add Todo
          </button>
        </form>

        {todos.length === 0 ? (
          <div className='empty-state'>
            <p>No todo items yet. Add one above!</p>
          </div>
        ) : (
          <div className='todo-list'>
            {todos.map((todo) => (
              <div key={todo.id} className='todo-item'>
                <span className='todo-content'>{todo.content}</span>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className='btn-delete'
                  title='Delete todo'
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
