import { Component, OnInit, OnDestroy } from '@angular/core';

import { Post } from '../post.model';
import { PostsService } from '../post.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})

export class PostListComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  private postsSub: Subscription;

  constructor(public postService: PostsService) {}

  ngOnInit() {
    this.posts = this.postService.getPosts();
    this.postsSub = this.postService.getPostUpdateListener()
      .subscribe((posts) => {
        this.posts = posts;
      });
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe();
  }
}

