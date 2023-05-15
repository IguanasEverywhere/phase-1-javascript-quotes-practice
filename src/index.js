const quoteList = document.querySelector('#quote-list');
const newQuoteForm = document.querySelector('#new-quote-form');
const editFormArea = document.querySelector('#edit-form-area');
const sortByAuthorBtn = document.querySelector('#sort-by-author');

editFormArea.style.display = 'none';

let allQuotes;
let sortedByAuthor = false;

sortByAuthorBtn.addEventListener('click', () => {
  sortedByAuthor = !sortedByAuthor;
  quoteList.innerHTML = '';
  let sortedQuotes = sortedByAuthor ? allQuotes.sort(compareAuthor) : allQuotes.sort(compareId);
  sortedQuotes.forEach(quote => buildQuoteCard(quote));
})

function compareAuthor(a, b) {
  if (a.author < b.author) {
    return -1;
  }
  if (b.author < a.author) {
    return 1;
  }
  return 0;
}

function compareId(a, b) {
  if (a.id < b.id) {
    return -1;
  }
  if (b.id < a.id) {
    return 1;
  }
  return 0;
}

function getAllQuotesFromDb() {
  fetch('http://localhost:3000/quotes?_embed=likes')
    .then(res => res.json())
    .then(quotes => {
      allQuotes = quotes;
      quoteList.innerHTML = '';
      allQuotes.forEach(quote => {
        buildQuoteCard(quote)
      });
    });
}
getAllQuotesFromDb();

function buildQuoteCard(quote) {
  let quoteCard = document.createElement('li');
  quoteCard.classList.add('quote-card');
  let blockQuote = document.createElement('blockquote');
  blockQuote.classList.add('blockquote');
  let quoteContent = document.createElement('p');
  quoteContent.classList.add('mb-0');
  quoteContent.textContent = quote.quote;
  let quoteAuthor = document.createElement('footer');
  quoteAuthor.classList.add('blockquote-footer');
  quoteAuthor.textContent = quote.author;
  let breakElem = document.createElement('br');
  let likeBtn = document.createElement('button');
  likeBtn.classList.add('btn-success');
  likeBtn.innerHTML = `Likes: <span>${quote.likes.length}</span>`;
  likeBtn.addEventListener('click', () => {
    updateLikes(quote);
  });
  deleteBtn = document.createElement('button');
  deleteBtn.classList.add('btn-danger');
  deleteBtn.innerHTML = 'Delete';
  deleteBtn.addEventListener('click', () => {
    deleteQuote(quote);
  });
  let editBtn = document.createElement('button');
  editBtn.innerHTML='Edit';
  editBtn.addEventListener('click', () => {
    editQuote(quote);
  });


  quoteCard.append(blockQuote);
  blockQuote.append(quoteContent);
  blockQuote.append(quoteAuthor);
  blockQuote.append(breakElem);
  blockQuote.append(likeBtn);
  blockQuote.append(deleteBtn);
  blockQuote.append(editBtn);
  quoteCard.append(blockQuote);

  quoteList.append(quoteCard);
}

newQuoteForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const newQuoteValue = document.querySelector('#new-quote').value;
  const newAuthorValue = document.querySelector('#author').value;

  fetch('http://localhost:3000/quotes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      quote: newQuoteValue,
      author: newAuthorValue
    })
  })
    .then(res => res.json())
    .then(postData => {
      getAllQuotesFromDb(); // doing a fresh GET request, is this what they have in mind?
    })
    .catch(err => console.error(error));
})

function deleteQuote(quote) {
  fetch(`http://localhost:3000/quotes/${quote.id}`, {
    method: 'DELETE'
  })
    .then(res => res.json())
    .then(deletedItem => getAllQuotesFromDb());
}

function updateLikes(quote) {
  fetch(`http://localhost:3000/likes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      'quoteId': parseInt(quote.id)
    })
  })
    .then(res => res.json())
    .then(data => getAllQuotesFromDb());
}

function editQuote(quote) {
  editFormArea.style.display = 'flex';
  const editQuoteInput = document.querySelector('#quote-content');
  const editAuthorInput = document.querySelector('#quote-author');
  const editForm = document.querySelector('#edit-quote-form');
  editQuoteInput.value = quote.quote;
  editAuthorInput.value = quote.author;

  editForm.addEventListener('submit', (e) => {
    editFormArea.style.display = 'none';
    e.preventDefault();
    fetch(`http://localhost:3000/quotes/${quote.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type' : 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        quote: editQuoteInput.value,
        author: editAuthorInput.value
      })
    })
    .then(res => res.json())
    .then(editedQuote => {
      getAllQuotesFromDb();
    })
  })
}