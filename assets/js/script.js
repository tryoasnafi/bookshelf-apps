const books = []
const RENDER_EVENT = 'render-book'
const STORAGE_KEY = "BOOKSHELF_APPS"

const submitButton = document.getElementById('submitButton')

const modal = document.getElementById('deleteModal')
const deleteButton = document.getElementsByClassName('delete-button')[0]

const titleElement = document.getElementById('bookTitle')
const authorElement = document.getElementById('bookAuthor')
const yearElement = document.getElementById('bookRelease')
const isCompleteElement = document.getElementById('isComplete')

document.addEventListener('DOMContentLoaded', () => {
    const submitBookForm = document.getElementById('submitBookForm')
    submitBookForm.addEventListener('submit', (event) => {
        if (submitButton.getAttribute('data-id')) {
            updateBook()
        } else {
            event.preventDefault();
            addBook()
        }

        submitBookForm.reset()
    })

    modalEvent()
    if (isStorageExist) loadBookFromStorage()
})

document.addEventListener(RENDER_EVENT, () => {
    const uncompletedReadBookList = document.getElementById("uncompletedRead")
    uncompletedReadBookList.innerHTML = ""

    const completedReadBookList = document.getElementById("completedRead")
    completedReadBookList.innerHTML = ""

    for (const book of books) {
        const bookElement = makeBook(book)
        if (book.isComplete == false) {
            uncompletedReadBookList.append(bookElement)
        } else {
            completedReadBookList.append(bookElement)
        }
    }
})

const modalEvent = () => {
    const closeButton = document.getElementsByClassName('close-button')[0]
    const cancelButton = document.getElementsByClassName('cancel-button')[0]

    const hideModal = () => modal.style.display = "none"

    closeButton.addEventListener('click', () => hideModal())

    cancelButton.addEventListener('click', () => hideModal())

    window.addEventListener('click', (event) => event.target == modal ? hideModal() : null)

    deleteButton.addEventListener('click', e => {
        e.preventDefault()
        const currentBookId = deleteButton.getAttribute("data-id")
        if (!currentBookId) {
            return alert("Buku tidak ditemukan")
        }
        console.log(currentBookId)
        let isRemoved = removeBookFromCompleted(+currentBookId)
        if (isRemoved) {
            hideModal()
        } else {
            throw new Error(`Failed to delete book with id: ${bookId}`)
        }
    })
}

const generateId = () => +new Date()

const generateBookObject = (id, title, author, year, isComplete) => {
    return {
        id,
        title,
        author,
        year,
        isComplete
    }
}

const addBook = () => {
    const id = generateId()
    const bookObject = generateBookObject(id, titleElement.value, authorElement.value, +yearElement.value, isCompleteElement.checked)
    console.log(typeof +yearElement.value)
    books.push(bookObject)

    document.dispatchEvent(new Event(RENDER_EVENT))
    saveData()
}

const makeBook = (bookObject) => {
    const textTitle = document.createElement("h5"),
        textAuthor = document.createElement("p"),
        textYear = document.createElement("p"),
        textContainer = document.createElement("div"),
        container = document.createElement("li")

    textTitle.innerText = bookObject.title
    textAuthor.innerText = bookObject.author
    textYear.innerText = bookObject.year

    textContainer.classList.add("inner")
    textContainer.append(textTitle, textAuthor, textYear)

    container.classList.add('list__item')
    container.append(textContainer)
    container.setAttribute("id", `book-${bookObject.id}`)

    const actionsContainer = document.createElement("section")
    actionsContainer.classList.add('section__actions')

    const trashButton = document.createElement("button")
    trashButton.classList.add('trash-button')
    trashButton.addEventListener('click', e => {
        e.preventDefault()
        confirmRemove(bookObject.id)
    })

    const editButton = document.createElement("button")
    editButton.classList.add('edit-button')
    editButton.addEventListener('click', e => {
        e.preventDefault()
        editBook(bookObject.id)
    })

    if (bookObject.isComplete) {
        const undoButton = document.createElement("button")
        undoButton.classList.add('undo-button')
        undoButton.addEventListener("click", () => undoBookFromCompleted(bookObject.id))

        actionsContainer.append(editButton, undoButton, trashButton)

    } else {
        const checkButton = document.createElement("button")
        checkButton.classList.add("check-button")
        checkButton.addEventListener('click', () => addBookCompleted(bookObject.id))

        actionsContainer.append(editButton, checkButton, trashButton)
    }

    container.append(actionsContainer)
    return container
}

const findBook = (bookId) => {
    for (const bookItem of books) {
        if (bookItem.id === bookId) return bookItem
    }
    return null
}

const findBookIndex = (bookId) => {
    for (const index in books) {
        if (books[index].id === bookId) return index
    }
    return -1
}

const addBookCompleted = (bookId) => {
    const bookTarget = findBook(bookId)
    if (bookTarget == null) return

    bookTarget.isComplete = true
    document.dispatchEvent(new Event(RENDER_EVENT))
    saveData()
}

const undoBookFromCompleted = (bookId) => {
    const bookTarget = findBook(bookId)
    if (bookTarget == null) return

    bookTarget.isComplete = false
    document.dispatchEvent(new Event(RENDER_EVENT))
    saveData()
}

const confirmRemove = (bookId) => {
    modal.style.display = "block"
    deleteButton.setAttribute("data-id", bookId)
}

const removeBookFromCompleted = (bookId) => {
    const bookIndex = findBookIndex(bookId)
    if (bookIndex === -1) return false

    books.splice(bookIndex, 1)
    document.dispatchEvent(new Event(RENDER_EVENT))
    saveData()

    return true
}

const isStorageExist = () => {
    if (typeof (Storage) === 'undefined') {
        alert("Browser kamu tidak mendukung local storage");
        return false
    }

    return true
}

const saveData = () => {
    if (isStorageExist()) {
        const bookStringify = JSON.stringify(books)
        localStorage.setItem(STORAGE_KEY, bookStringify)
    }
}

const loadBookFromStorage = () => {
    const serializedData = localStorage.getItem(STORAGE_KEY);

    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (let book of data) {
            books.push(book);
        }
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
}

// Search fitur
const searchInput = document.getElementById("search")
searchInput.addEventListener("keyup", () => {
    const filter = searchInput.value.toLowerCase()
    const bookItems = document.getElementsByClassName("list__item")

    for (const bookItem of bookItems) {
        const title = bookItem.firstElementChild.textContent
        if (title.toLowerCase().indexOf(filter) != -1) {
            bookItem.style.display = ""
        } else {
            bookItem.style.display = "none"
        }
    }
})

// Edit book feature
const editBook = (bookId) => {
    const bookTarget = findBook(bookId)

    titleElement.value = bookTarget.title
    authorElement.value = bookTarget.author
    yearElement.value = bookTarget.year
    isCompleteElement.checked = bookTarget.isComplete

    submitButton.setAttribute('data-id', bookId)
    submitButton.innerHTML = "<strong>UPDATE</strong>"
    document.getElementById("bookFormHeader").innerHTML = "Update Book"
}

const updateBook = () => {
    const id = +submitButton.getAttribute('data-id')

    const bookTarget = findBook(id)
    bookTarget.title = titleElement.value
    bookTarget.author = authorElement.value
    bookTarget.year = +yearElement.value
    bookTarget.isComplete = isCompleteElement.checked

    document.dispatchEvent(new Event(RENDER_EVENT))
    saveData()
}