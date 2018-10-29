import { Post } from './post.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';

const mapPost = (post) => ({ title: post.title, content: post.content, id: post._id });
const MAIN_URL = 'http://localhost:3000';
const POSTS_API = '/api/posts';
const FULL_POSTS_URL = `${MAIN_URL}${POSTS_API}`;

@Injectable({ providedIn: 'root' })
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();

  constructor(private http: HttpClient) {}

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
  addPost(title: string, content: string) {
    const post: Post = { id: null, title, content };
    this.http.post<{ message: string, postId: string }>(FULL_POSTS_URL, post)
      .subscribe((response) => {
        post.id = response.postId;
        this.posts.push(post);
        this.postsUpdated.next([...this.posts]);
      });
  }

  deletePost(id: string) {
    this.http.delete<{ message: string }>(`${FULL_POSTS_URL}/${id}`)
    .subscribe((response) => {
        const updatedPosts = this.posts.filter((post) => post.id !== id);
        this.postsUpdated.next([...updatedPosts]);
      });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }
}
