let skip = 0;
let newlyAddedTodos = []; // Track newly added todos to prevent duplication in pagination

window.onload = generateTodos();

function generateTodos() {
  axios
    .get(`/read-item?skip=${skip}`)
    .then((res) => {
      console.log(res);

      if (res.data.status !== 200) {
        alert(res.data.message);
        return;
      }
      const todos = res.data.data;
      console.log(skip);
      
      // Update skip only for the todos loaded from the server, not the new ones
      skip += todos.length;

      // Filter out todos already added by the user
      const filteredTodos = todos.filter(
        (item) => !newlyAddedTodos.some((newTodo) => newTodo._id === item._id)
      );

      document.getElementById("item_list").insertAdjacentHTML(
        "beforeend",
        filteredTodos
          .map((item) => {
            return `
        <li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
            <span class="item-text"> ${item.todo}</span>
        <div>
            <button data-id="${item._id}" class="edit-me btn btn-secondary btn-sm mr-1">Edit</button>
            <button data-id="${item._id}" class="delete-me btn btn-danger btn-sm">Delete</button>
        </div>
      </li>`;
          })
          .join("")
      );
    })
    .catch((err) => console.log(err));
}

document.addEventListener("click", function (event) {
  if (event.target.classList.contains("edit-me")) {
    const todoId = event.target.getAttribute("data-id");
    const newData = prompt("Enter new Todo Text");

    axios
      .post("/edit-item", { newData, todoId })
      .then((res) => {
        if (res.data.status !== 200) {
          alert(res.data.message);
          return;
        }

        event.target.parentElement.parentElement.querySelector(
          ".item-text"
        ).innerHTML = newData;
      })
      .catch((err) => console.log(err));
  } else if (event.target.classList.contains("delete-me")) {
    const todoId = event.target.getAttribute("data-id");

    axios
      .post("/delete-item", { todoId })
      .then((res) => {
        if (res.data.status !== 200) {
          alert(res.data.message);
          return;
        }

        // Remove from both UI and the newly added todo list
        newlyAddedTodos = newlyAddedTodos.filter((todo) => todo._id !== todoId);
        event.target.parentElement.parentElement.remove();
      })
      .catch((err) => console.log(err));
  } else if (event.target.classList.contains("add_item")) {
    const todo = document.getElementById("create_field").value;

    axios
      .post("/create-item", { todo })
      .then((res) => {
        if (res.data.status !== 201) {
          alert(res.data.message);
          return;
        }

        document.getElementById("create_field").value = "";

        const newTodo = res.data.data;
        newlyAddedTodos.push(newTodo); // Track new todos to prevent duplication

        document.getElementById("item_list").insertAdjacentHTML(
          "beforeend",
          `<li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
                <span class="item-text"> ${newTodo.todo}</span>
            <div>
                <button data-id="${newTodo._id}" class="edit-me btn btn-secondary btn-sm mr-1">Edit</button>
                <button data-id="${newTodo._id}" class="delete-me btn btn-danger btn-sm">Delete</button>
            </div>
          </li>`
        );
      })
      .catch((err) => console.log(err));
  } else if (event.target.classList.contains("logout-me")) {
    axios
      .post("/logout")
      .then((res) => {
        if (res.status !== 200) {
          alert(res.data);
          return;
        }

        window.location.href = "/login";
      })
      .catch((err) => console.log(err));
  } else if (event.target.classList.contains("show_more")) {
    generateTodos();
  }
});


// client(axios) <------> Server(express api) <-------> Database(mongodb)