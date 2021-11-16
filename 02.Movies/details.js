// initialization
// - find relevent section

import { e, showView } from "./dom.js";
import { showEdit } from "./edit.js";
import { showHome } from "./home.js";

// - detach section from DOM
const section = document.getElementById('movie-details');
section.remove();

// display logic
export function showDetails(movieId) {
    showView(section);
    getMovie(movieId);
}

async function getMovie(id) {
    section.replaceChildren(e('p', {}, 'Loading...'));

    const requests = [
        fetch('http://localhost:3030/data/movies/' + id),
        fetch(`http://localhost:3030/data/likes?where=movieId%3D%22${id}%22&distinct=_ownerId&count`),        
    ];

    const userData = JSON.parse(sessionStorage.getItem('userData'));
    if (userData != null) {
        requests.push(fetch(`http://localhost:3030/data/likes?where=movieId%3D%22${id}%22%20and%20_ownerId%3D%22${userData.id}%22`));
    }
    
    const [movieRes, likesRes, hasLikedRes] = await Promise.all(requests);
    const [movieData, likes, hasLiked] = await Promise.all([
        movieRes.json(),
        likesRes.json(),
        hasLikedRes && hasLikedRes.json()
    ]);

    section.replaceChildren(createDetails(movieData, likes, hasLiked));
}

function createDetails(movie, likes, hasLiked) {
    console.log(hasLiked);
    const controls = e('div', {className: 'col-md-4 text-center'},
        e('h3', {className: 'my-3'}, 'Movie Description'),
        e('p', {}, movie.description)
    );

    const userData = JSON.parse(sessionStorage.getItem('userData'));

    if (userData != null) {
        if (userData.id == movie._ownerId) {
            controls.appendChild(e('a', { className: 'btn btn-danger', href: '#', onClick: (e) => onDelete(e, movie._id) }, 'Delete'));
            controls.appendChild(e('a', { className: 'btn btn-warning', href: '#', onClick: () => showEdit(movie._id) }, 'Edit'));
        } else {
            if (hasLiked.length > 0) {
                controls.appendChild(e('a', {className: 'btn btn-primary', href: '#', onClick: onUnlike}, 'Unlike'));
            } else {
                controls.appendChild(e('a', {className: 'btn btn-primary', href: '#', onClick: onLike}, 'Like'));
            }
        }
    }
    controls.appendChild(e('span', {className: 'enrolled-span'}, `Liked ${likes}`));

    const element = e('div', { className: 'container' },
    e('div', { className: 'row bg-light text-dark' },
        e('h1', {}, `Movie title: ${movie.title}`),
        e('div', { className: 'col-md-8' },
        e('img',  { className: 'img-thumbnail', src: movie.img, alt: 'Movie' })
        ),
        controls
    )
  );

    return element;

async function onLike() {
    await fetch('http://localhost:3030/data/likes', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'X-Authorization': userData.token
        },
        body: JSON.stringify({
            movieId: movie._id
        })
    });

    showDetails(movie._id);
    }

    async function onUnlike() {
        const likeId = hasLiked[0]._id;

        await fetch('http://localhost:3030/data/likes/' + likeId, {
            method: 'delete',
            headers: {
                'X-Authorization': userData.token
            }
        });
    
        showDetails(movie._id);
    }

    async function onDelete(event, id) {
        event.preventDefault();
    
        const conf = confirm('Are you sure you want to delete this movie?');
    
        if (conf) {
            const response = await fetch(`http://localhost:3030/data/movies/${id}`, {
                method: 'delete',
                headers: {
                    'X-Authorization': userData.token
                }
            });
    
            if (!response.ok) {
                const error = await response.json();
                return alert(error.message);
            }
    
            showHome();
            alert('Movie deleted!')
        }
    }
}
