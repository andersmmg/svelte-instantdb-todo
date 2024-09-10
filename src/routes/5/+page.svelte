<script lang="ts">
  import { id, init, tx } from "@instantdb/core";
  import { onMount } from "svelte";

  const APP_ID = "";

  interface Todo {
    id: string;
    text: string;
    done: boolean;
    createdAt: number;
  }

  type Schema = {
    todos: Todo;
  };

  let todos = $state<Todo[]>([]);
  let newTodoText = $state("");
  let error = $state("");
  let darkMode = $state(false);

  // Initialize the database
  const db = init<Schema>({ appId: APP_ID });

  onMount(() => {
    // Subscribe to data
    db.subscribeQuery({ todos: {} }, (resp) => {
      if (resp.error) {
        error = resp.error.message;
        return;
      }
      if (resp.data) {
        todos = resp.data.todos;
      }
    });

    // Check for user's preferred color scheme
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      darkMode = true;
    }
  });

  function addTodo(event: Event) {
    event.preventDefault();

    if (newTodoText.trim()) {
      db.transact(
        tx.todos[id()].update({
          text: newTodoText,
          done: false,
          createdAt: Date.now(),
        }),
      );
      newTodoText = "";
    }
  }

  function deleteTodo(todo: Todo) {
    db.transact(tx.todos[todo.id].delete());
  }

  function toggleDone(todo: Todo) {
    db.transact(tx.todos[todo.id].update({ done: !todo.done }));
  }

  function deleteCompleted() {
    const completed = todos.filter((todo) => todo.done);
    const txs = completed.map((todo) => tx.todos[todo.id].delete());
    db.transact(txs);
  }

  function toggleAllTodos() {
    const newVal = !todos.every((todo) => todo.done);
    db.transact(todos.map((todo) => tx.todos[todo.id].update({ done: newVal })));
  }

  function toggleDarkMode() {
    darkMode = !darkMode;
  }

  $effect(() => {
    if (typeof document !== "undefined") {
      document.body.classList.toggle("dark-mode", darkMode);
    }
  });
</script>

<div class="container" class:dark-mode={darkMode}>
  <h1 class="header">todos</h1>

  <button class="theme-toggle" onclick={toggleDarkMode}>
    {darkMode ? '☀️' : '🌙'}
  </button>

  {#if error}
    <div class="error">{error}</div>
  {:else}
    <div class="form">
      <div role="button" tabindex="0" class="toggle-all" onclick={toggleAllTodos}>⌄</div>
      <form onsubmit={addTodo}>
        <input
          bind:value={newTodoText}
          style="width: 100%"
          placeholder="What needs to be done?"
          type="text"
          autofocus
        />
      </form>
    </div>

    <div class="todo-list">
      {#each todos as todo}
        <div class="todo">
          <input
            type="checkbox"
            checked={todo.done}
            onchange={() => toggleDone(todo)}
          />
          <div class="todo-text" class:done={todo.done}>
            {todo.text}
          </div>
          <span role="button" tabindex="0" class="delete" onclick={() => deleteTodo(todo)}>𝘟</span>
        </div>
      {/each}
    </div>

    <div class="action-bar">
      <div>Remaining todos: {todos.filter(t => !t.done).length}</div>
      <a role="button" tabindex="0" class="delete-completed" onclick={deleteCompleted}>Delete Completed</a>
    </div>

    <div class="footer">Open another tab to see todos update in realtime!</div>
  {/if}
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    transition: background-color 0.3s ease;
  }

  :global(body.dark-mode) {
    background-color: #1a1a1a;
    color: #f0f0f0;
  }

  .container {
    box-sizing: border-box;
    font-family: code, monospace;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    padding: 20px;
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  .container.dark-mode {
    background-color: #1a1a1a;
    color: #f0f0f0;
  }

  .header {
    letter-spacing: 2px;
    font-size: 50px;
    color: #d3d3d3;
    margin-bottom: 10px;
  }

  .theme-toggle {
    position: absolute;
    top: 20px;
    right: 20px;
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    padding: 5px;
    border-radius: 50%;
    transition: background-color 0.3s ease;
  }

  .theme-toggle:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }

  .dark-mode .theme-toggle:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .form {
    box-sizing: border-box;
    display: flex;
    border: 1px solid #d3d3d3;
    border-bottom-width: 0px;
    width: 350px;
  }

  .dark-mode .form {
    border-color: #4a4a4a;
  }

  .toggle-all {
    font-size: 30px;
    cursor: pointer;
    padding: 5px 11px;
    line-height: 0.5;
  }

  form {
    flex-grow: 1;
  }

  input {
    background-color: transparent;
    font-family: code, monospace;
    padding: 10px;
    border: none;
    outline: none;
    box-sizing: border-box;
    color: inherit;
  }

  input::placeholder {
    font-style: italic;
  }

  .todo-list {
    box-sizing: border-box;
    width: 350px;
  }

  .todo {
    display: flex;
    align-items: center;
    padding: 10px;
    border: 1px solid #d3d3d3;
    border-bottom-width: 0px;
  }

  .dark-mode .todo {
    border-color: #4a4a4a;
  }

  .todo:last-child {
    border-bottom-width: 1px;
  }

  .todo input[type="checkbox"] {
    margin: 0 15px 0 5px;
    cursor: pointer;
  }

  .todo-text {
    flex-grow: 1;
    overflow: hidden;
    word-break: break-word;
  }

  .todo-text.done {
    text-decoration: line-through;
    color: #888;
  }

  .dark-mode .todo-text.done {
    color: #666;
  }

  .delete {
    width: 25px;
    cursor: pointer;
    color: #d3d3d3;
    text-align: center;
  }

  .dark-mode .delete {
    color: #666;
  }

  .action-bar {
    display: flex;
    justify-content: space-between;
    width: 350px;
    padding: 10px;
    border: 1px solid #d3d3d3;
    font-size: 10px;
    box-sizing: border-box;
  }

  .dark-mode .action-bar {
    border-color: #4a4a4a;
  }

  .delete-completed {
    cursor: pointer;
  }

  .footer {
    margin-top: 20px;
    font-size: 10px;
  }

  .error {
    color: #ff6b6b;
    margin-bottom: 10px;
  }
</style>
