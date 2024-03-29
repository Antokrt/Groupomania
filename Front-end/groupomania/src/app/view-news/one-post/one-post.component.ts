import {Component, Input, OnInit} from '@angular/core';
import * as moment from 'moment';
import {faArrowDown, faArrowUp, faEdit, faEllipsisH, faThumbsUp, faTrashAlt} from '@fortawesome/free-solid-svg-icons';
import {ViewNewsComponent} from '../view-news.component';
import {PostService} from '../../services/post.service';
import {Comment} from '../../models/comment.model';
import {Router} from '@angular/router';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {User} from '../../models/user.model';
import {UserService} from '../../services/user.service';

const date = moment();

@Component({
  selector: 'app-one-post',
  templateUrl: './one-post.component.html',
  styleUrls: ['./one-post.component.scss']
})

export class OnePostComponent implements OnInit {
  profilUser: User;
  comment: Comment[];
  commentForm: FormGroup;
  @Input() postTitle: string;
  @Input() postAuthor: string;
  @Input() postUrlImg: string;
  @Input() descriptionPost: string;
  @Input() countLike: number;
  @Input() id: string;
  @Input() datePost: string;
  @Input() hasLikeBis: boolean;
  hasComments: boolean;
  seeComment = true;
  canDeleteComment: boolean;
  isDelete: boolean;
  isAutor: boolean;
  isAdmin: boolean;
  like: number;
  faEdit = faEdit;
  faEllipsisH = faEllipsisH;
  faThumbsUp = faThumbsUp;
  faTrashAlt = faTrashAlt;
  faArrowTop = faArrowUp;
  faArrowDown = faArrowDown;

  constructor(private postService: PostService,
              private router: Router,
              private viewComponent: ViewNewsComponent,
              private http: HttpClient,
              private userService: UserService,
              private formBuilder: FormBuilder) {
  }

  ngOnInit(): void { // Récupere les infos de l'utilisateur connecté et vérifie si il a déja like le post \\
    this.userService.getUserAsync().then((result: User) => {
      this.profilUser = result;
      this.getComment().then(() => {
        if (this.comment.length > 5) {
          this.seeComment = false;
        }
        this.initForm();
      });
      this.profilUser = result;
      if (this.profilUser.isAdmin === true) {
        this.isAdmin = true;
      }
      if (this.profilUser.pseudo === this.postAuthor) {
        this.isAutor = true;
      }
    }).then(() => {
      this.hasLikeFunc(this.id, this.profilUser.user_id);
    });
  }

  deletePost(id: string) {
    this.postService.deletePost(id).then(() => this.postService.getAllPost());
  }

  likePost(id: string) {
    this.postService.like(id, this.like, this.profilUser.user_id).then(() => {
      this.hasLikeFunc(this.id, this.profilUser.user_id);
      if (!this.hasLikeBis) {
        this.countLike++;
      } else {
        this.countLike--;
      }
    }).catch((err) => {
      console.log(err);
    });
  }

  hasLikeFunc(postId: string, userId: number) {
    const likeObject = {
      post_id: postId,
      user_id: userId
    };

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    this.http.post('http://localhost:3000/like/', likeObject, httpOptions).toPromise()
      .then((result: number) => {
        if (result === 0) {
          this.hasLikeBis = false;
          this.like = 1;
        }
        if (result === 1) {
          this.hasLikeBis = true;
          this.like = 0;
        }
      })
      .catch((err) => console.log(err));
  }

  getComment() {
    return new Promise(((resolve, reject) => {
      this.http.get('http://localhost:3000/comment/' + this.id).toPromise()
        .then((result: Comment[]) => {
          this.comment = result;

          for (let i = 0; i < this.comment.length; i++) {
            const datePost = this.comment[i].date_comment;

            const date = moment(datePost).locale('fr').utc().fromNow();
            this.comment[i].date_comment = date;
            if (this.profilUser?.pseudo === this.comment[i]?.pseudo || this.profilUser?.isAdmin === true) {
              this.comment[i].canDelete = true;
            }
          }

          resolve(result);
        })
        .catch((err) => reject(err));
    }));
  }

  initForm() {
    this.commentForm = this.formBuilder.group({
      pseudo: [this.profilUser?.pseudo, [Validators.required, Validators.minLength(5)]],
      comment_text: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  onSubmitForm() {
    const formValue = this.commentForm.value;
    this.postService.sendNewComment(this.id, formValue)
      .then(() => {
        this.commentForm.get(['comment_text']).setValue('');
        this.getComment();
        this.seeComment = true;
      })
      .catch((err) => console.log(err));
  }

  disableViewComment() {
    this.seeComment = !this.seeComment;
  }

  deleteComment(value: number) {
    this.postService.deleteComment(this.id, value)
      .then(() => this.getComment())
      .catch((err) => console.log(err));
  }
}

