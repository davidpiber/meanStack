import { Post } from './post.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();

  constructor(private http: HttpClient) {}

  getPosts() {
    this.http.get<Post[]>('http://localhost:3000/posts')
      .subscribe((postData) => {
        this.posts = postData;
        this.postsUpdated.next([...this.posts]);
      });
  }
  addPost(title: string, content: string) {
    const post: Post = { id: null, title, content };
    this.http.post<{ message: string }>('http://localhost:3000/posts', post)
      .subscribe((response) => {
        console.log(response);
        this.posts.push(post);
        this.postsUpdated.next([...this.posts]);
      });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }
}
