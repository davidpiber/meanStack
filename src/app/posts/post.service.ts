import { Post } from './post.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

const mapPost = (post) => ({
  title: post.title,
  content: post.content,
  id: post._id,
  imagePath: post.imagePath,
  creator: post.creator
});

const MAIN_URL = 'http://localhost:3000';
const POSTS_API = '/api/posts';
const FULL_POSTS_URL = `${MAIN_URL}${POSTS_API}`;

@Injectable({ providedIn: 'root' })
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{ posts: Post[], postsCount: number }>();

  constructor(private http: HttpClient, private router: Router) {}

  getPosts(postsPerPage: number, currentPage: number) {
    const queryParams = `?pageSize=${postsPerPage}&page=${currentPage}`;
    this.http.get<{ posts: any, maxPosts: number }>(`${FULL_POSTS_URL}${queryParams}`)
      .pipe(map((data) => {
        return {
          posts: data.posts.map(mapPost),
          maxPosts : data.maxPosts
        };
      }))
      .subscribe((postsData) => {
        this.posts = postsData.posts;
        this.postsUpdated.next({ posts: [...this.posts], postsCount: postsData.maxPosts });
      });
  }
  addPost(postTitle: string, postContent: string, image: File) {
    const postData = new FormData();
    postData.append('title', postTitle);
    postData.append('content', postContent);
    postData.append('image', image, postTitle);
    this.http.post<{ post: Post }>(FULL_POSTS_URL, postData)
      .subscribe((response) => this.router.navigate(['/']));
  }

  deletePost(id: string) {
    return this.http.delete<{ message: string }>(`${FULL_POSTS_URL}/${id}`);
  }

  updatePost(id: string, title: string, content: string, image: File | string) {
    let postData: Post | FormData;
    if (typeof image === 'object') {
      postData = new FormData();
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    } else {
      postData = {
        id,
        title,
        content,
        imagePath: image,
        creator: null
      };
    }
    this.http.put<{ post: Post }>(`${FULL_POSTS_URL}/${id}`, postData)
    .subscribe(() => this.router.navigate(['/']));
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  getPost(id: string) {
    return this.http.get<{_id: string, title: string, content: string, imagePath: string, creator: string}>(`${FULL_POSTS_URL}/${id}`);
  }
}
