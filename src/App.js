import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function App() {
  const [todos, setTodos] = useState([]); // Todos state
  const [newTodo, setNewTodo] = useState(""); // Yeni todo'nun state'i

  // WebSocket bağlantısı kur
  const socket = new WebSocket("ws://localhost:5000");

  socket.onopen = () => {
    console.log("WebSocket bağlantısı kuruldu.");
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.deleted) {
      // Silinen todo'yu todos state'inden çıkar
      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== data.id));
    } else {
      // Yeni todo'yu todos state'ine ekle
      setTodos((prevTodos) => [data, ...prevTodos]);
    }
  };

  // Verileri API'den çekme (GET)
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await fetch("http://localhost:5000/todos");
        const data = await response.json();
        setTodos(data); // Alınan veriyi todos state'ine atıyoruz
      } catch (error) {
        console.error("Error fetching todos:", error);
      }
    };

    fetchTodos();
  }, []); // Component mount olduğunda çalışacak

  // Yeni todo ekleme (POST)
  const addTodo = async () => {
    if (newTodo.trim() === "") return;

    const newTodoItem = {
      title: newTodo, // title olarak kaydediyoruz
      completed: false, // Başlangıçta tamamlanmamış olarak ayarlıyoruz
    };

    try {
      const response = await fetch("http://localhost:5000/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTodoItem),
      });

      if (response.ok) {
        const addedTodo = await response.json();
        setTodos((prevTodos) => [addedTodo, ...prevTodos]); // Yeni todo'yu listeye ekle
        setNewTodo(""); // Input'u temizle
      } else {
        console.error("Error adding todo:", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  // Todo silme (DELETE)
  const deleteTodo = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/todos/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Silinen todo'yu todos state'inden çıkartıyoruz
        setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
      } else {
        console.error("Error deleting todo:", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  // Todo güncelleme (PATCH)
  const toggleTodo = async (id, completed) => {
    try {
      const response = await fetch(`http://localhost:5000/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !completed }),
      });

      if (response.ok) {
        const updatedTodo = await response.json();
        setTodos((prevTodos) =>
          prevTodos.map((todo) => (todo.id === id ? updatedTodo : todo))
        );
      } else {
        console.error("Error updating todo:", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error.message);
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
  {todos.length === 0 ? (
    <li className="list-group-item">Henüz todo eklenmedi.</li>
  ) : (
    todos.map((todo) => (
      <li
        key={todo.id} // Todo'nun id'sini key olarak kullanıyoruz
        className={`list-group-item d-flex justify-content-between align-items-center ${
          todo.completed ? "list-group-item-success" : ""
        }`}
      >
        <span
          onClick={() => toggleTodo(todo.id, todo.completed)} // Todo'nun tamamlanma durumunu değiştir
          style={{
            textDecoration: todo.completed ? "line-through" : "none",
            cursor: "pointer",
          }}
        >
          {todo.title}
        </span>
        <button
          onClick={() => deleteTodo(todo.id)} // Silme butonuna tıklandığında todo'yu sil
          className="btn btn-danger btn-sm"
        >
          Sil
        </button>
      </li>
    ))
  )}
</ul>

    </div>
  );
}
