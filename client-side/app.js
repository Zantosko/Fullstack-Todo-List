let items = document.querySelector(".items");
const addButton = document.querySelector(".btn");
const userInput = document.querySelector(".input");
const ul = document.createElement("ul");

function getuuid() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

addButton.addEventListener("click", addTask)

async function addTask() {
  if (userInput.value === "") return alert("Please fill out task field!")

  const inputValue = await userInput.value

  const itemBody = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json" 
    },
    body: JSON.stringify({
      text: inputValue
    })
  }

  //* Creates item in the database
  await fetch("http://localhost:3030/note", itemBody)

  //* Reads all items in the database
  const data = await fetch("http://localhost:3030/read_notes")
  const jsonData = await data.json()

  // Iterates over data paints it on the DOM
  for (let item of jsonData.rows) {
    const li = document.createElement("li");
    li.className = "task";
    li.innerHTML = `
        <div class="note-container">
          <p class="note-text">${item.text}</p>
        </div>
      `
    const uuid = getuuid();
    li.setAttribute("data-id", uuid);

    const buttonContainer = document.createElement("div");
    buttonContainer.setAttribute("class", "btn-box")
  
    const editButton = document.createElement("button");
    editButton.classList.add("edit-btn");
    editButton.innerHTML = "Edit Task";

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-btn");
    deleteButton.innerHTML = "Delete Task";

    buttonContainer.append(editButton, deleteButton)
  
    const idElement = document.createElement("span");
    idElement.textContent = uuid;
    idElement.style.display = "none";
    li.append(idElement);
  
    const newInput = document.createElement("input");
    newInput.setAttribute("type", "hidden");
    newInput.setAttribute("id", uuid);
    newInput.value = uuid;
    li.append(newInput);
  
    li.append(buttonContainer);
    ul.insertAdjacentElement("beforeend", li);
    items.append(ul);

    editButton.addEventListener("click", () => editTask(uuid, item.note_id))
  
    deleteButton.addEventListener("click", () => deleteTask(uuid, item.note_id));

    userInput.value = "";
    userInput.focus();
  }

}


async function editTask(id, idDB) {
  const allListElement = Array.from(document.querySelectorAll("li.task"));
  const elementToEdit = allListElement.find(el => el.dataset.id === id);
  const textToChange = elementToEdit.childNodes[1].childNodes[1];
  
  // items div
  const body = document.querySelector("body");

  // Create 1st div (overlay)
  let div = document.createElement("div");

  // Create 2nd div (modal-content)
  let modalContent = document.createElement("div");

  // Create close button
  let closeBtn = document.createElement("span");

  // * Assign classes
  // 1st div class
  div.classList.add("modal-effect");
  // 2nd div class
  modalContent.classList.add("modal-info");
  // close button class
  closeBtn.classList.add("closeBtn");


  // * Insert HTML
  // Insert HTML into 2nd div
  modalContent.innerHTML = `
    <div class="content-container">
      <input type="text" class="u-full-width new-input">
      <br>
      <button class="u-full-width edit" id="button">Submit Changes</button>
    </div>
  `;
  // Insert HTML into span element
  closeBtn.innerHTML = "&times;";

  // * Append Elements
  // Append close button element to 2nd div (modal-content)
  modalContent.appendChild(closeBtn);
  // Append 2nd div to the intial div created
  div.appendChild(modalContent);
  // Append the new div to the container div
  body.appendChild(div);


  // Event listener to close modal when "x" is clicked
  closeBtn.addEventListener("click", function(e) {
    body.removeChild(div);
  });

  // Event listener to close when the window outside the modal is clicked
  window.addEventListener("click", function(e) {
    if (e.target === div) {
      body.removeChild(div);
    }
  });

  const newInput = document.querySelector(".new-input");
  const submitChanges = document.querySelector(".edit")

  submitChanges.addEventListener("click", async () => {
    textToChange.innerHTML = newInput.value
    body.removeChild(div);

    const itemBody = {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({
        text: newInput.value
      })
    }

    await fetch(`http://localhost:3030/edit_note/${idDB}`, itemBody)
    alert(`Item: ${idDB} has been updated!`)
  })
}


async function deleteTask(id, idDB) {
  const ulist = document.querySelector("ul");
  const allListElement = Array.from(document.querySelectorAll("li.task"));
  const elementToDelete = allListElement.find(el => el.dataset.id === id);
  ulist.removeChild(elementToDelete)

  //* Deletes item from the database
  const itemBody = {
    method: "DELETE"
  }

  await fetch(`http://localhost:3030/delete_note/${idDB}`, itemBody)
  
  alert(`Item: ${idDB} was successfully deleted`)

}