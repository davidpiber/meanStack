import { Post } from './post.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

const mapPost = (post) => ({ title: post.title, content: post.content, id: post._id });
const MAIN_URL = 'http://localhost:3000';
const POSTS_API = '/api/posts';
const FULL_POSTS_URL = `${MAIN_URL}${POSTS_API}`;

@Injectable({ providedIn: 'root' })
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();

  constructor(private http: HttpClient, private router: Router) {}

  getPosts() {
    this.http.get<{ posts: any }>(FULL_POSTS_URL)
      .pipe(map((data) => {
        return data.posts.map(mapPost);
      }))
      .subscribe((posts) => {
        this.posts = posts;
        this.postsUpdated.next([...this.posts]);
      });
  }
  addPost(title: string, content: string, image: File) {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);
    this.http.post<{ postId: string }>(FULL_POSTS_URL, postData)
      .subscribe((response) => {
        const post: Post = { title, content, id: response.postId };
        this.posts.push(post);
        this.postsUpdated.next([...this.posts]);
        this.router.navigate(['/']);
      });
  }

  deletePost(id: string) {
    this.http.delete<{ message: string }>(`${FULL_POSTS_URL}/${id}`)
    .subscribe((response) => {
        const updatedPosts = this.posts.filter((post) => post.id !== id);
        this.postsUpdated.next([...updatedPosts]);
      });
  }

  updatePost(id: string, title: string, content: string) {
    const post: Post = { id, title, content };
    this.http.put(`${FULL_POSTS_URL}/${id}`, post)
    .subscribe((response) => {
        const updatedPosts = [...this.posts];
        const oldPostIndex = updatedPosts.findIndex((p) => p.id === post.id);
        updatedPosts[oldPostIndex] = post;
        this.posts = updatedPosts;
        this.postsUpdated.next([...this.posts]);
        this.router.navigate(['/']);
      });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  getPost(id: string) {
    return this.http.get<{_id: string, title: string, content: string}>(`${FULL_POSTS_URL}/${id}`);
  }
}
