import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");

  // JSON Server'dan verileri çek
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    const response = await fetch("http://localhost:5000/todos");
    const data = await response.json();
    setTodos(data);
  };

  // Yeni todo ekle
  const addTodo = async () => {
    if (newTodo.trim() === "") return;

    const newTodoItem = {
      title: newTodo,
      completed: false,
    };

    const response = await fetch("http://localhost:5000/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTodoItem),
    });

    if (response.ok) {
      const addedTodo = await response.json();
      setTodos([addedTodo, ...todos]);
      setNewTodo(""); // Input'u temizle
    }
  };

  // Todo sil
  const deleteTodo = async (id) => {
    const response = await fetch(`http://localhost:5000/todos/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      setTodos(todos.filter((todo) => todo.id !== id));
    }
  };

  // Todo güncelle
  const toggleTodo = async (id, completed) => {
    const response = await fetch(`http://localhost:5000/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !completed }),
    });

    if (response.ok) {
      const updatedTodo = await response.json();
      setTodos(
        todos.map((todo) => (todo.id === id ? updatedTodo : todo))
      );
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center">Todo List</h1>

      {/* Yeni Todo Ekle */}
      <div className="input-group mb-3">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Yeni bir todo ekleyin..."
          className="form-control"
        />
        <button onClick={addTodo} className="btn btn-primary">
          Ekle
        </button>
      </div>

      {/* Todo Listesi */}
      <ul className="list-group">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className={`list-group-item d-flex justify-content-between align-items-center ${
              todo.completed ? "list-group-item-success" : ""
            }`}
          >
            <span
              onClick={() => toggleTodo(todo.id, todo.completed)}
              style={{
                textDecoration: todo.completed ? "line-through" : "none",
                cursor: "pointer",
              }}
            >
              {todo.title}
            </span>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="btn btn-danger btn-sm"
            >
              Sil
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
