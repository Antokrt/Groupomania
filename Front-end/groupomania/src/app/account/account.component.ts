import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {UserService} from '../services/user.service';
import {Router} from '@angular/router';
import {User} from '../models/user.model';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {
  deleteAccount: boolean;
  deleteForm: FormGroup;
  profilUser: User;
  errMsg: string;

  constructor(private formBuilder: FormBuilder,
              private userService: UserService,
              private router: Router) {
  }

  ngOnInit(): void {
   this.userService.getUserAsync()
     .then((response: User) => {
       this.profilUser = response;
       this.profilUser.dateCreation =  this.userService.getDateCreationUser();
       this.initForm();
     });
  }

  initForm() {
    this.deleteForm = this.formBuilder.group({
      user_id: [this.profilUser.user_id, [Validators.required, Validators.minLength(1)]],
      password: ['', [Validators.required, Validators.minLength(5)]],
      pseudo: [this.profilUser.pseudo]
    });
  }

  onDeleteBtn() {
    this.deleteAccount = true;
  }

  onSubmitForm() {
    const formValue = this.deleteForm.value;
    this.userService.deleteUser(formValue)
      .then(() => this.userService.logout())
      .catch((err) => {
        if (err.status === 401) {
          this.errMsg = 'Mot de passe incorrect';
        }
        else {
          this.errMsg = 'Impossible de supprimer le compte';
        }
      });

  }
}
