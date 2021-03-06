// (C) Copyright 2015 Moodle Pty Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CoreSiteInfo } from '@classes/site';
import { CoreUserTours, CoreUserToursAlignment, CoreUserToursSide } from '@features/usertours/services/user-tours';
import { IonRouterOutlet } from '@ionic/angular';
import { CoreScreen } from '@services/screen';
import { CoreSites } from '@services/sites';
import { CoreDomUtils } from '@services/utils/dom';
import { CoreMainMenuUserMenuTourComponent } from '../user-menu-tour/user-menu-tour';
import { CoreMainMenuUserMenuComponent } from '../user-menu/user-menu';

/**
 * Component to display an avatar on the header to open user menu.
 *
 * Example: <core-user-menu-button></core-user-menu-button>
 */
@Component({
    selector: 'core-user-menu-button',
    templateUrl: 'user-menu-button.html',
    styleUrls: ['user-menu-button.scss'],
})
export class CoreMainMenuUserButtonComponent implements OnInit {

    siteInfo?: CoreSiteInfo;
    isMainScreen = false;

    @ViewChild('avatar', { read: ElementRef }) avatar?: ElementRef<HTMLElement>;

    constructor(protected routerOutlet: IonRouterOutlet) {
        const currentSite = CoreSites.getRequiredCurrentSite();

        this.siteInfo = currentSite.getInfo();
    }

    /**
     * @inheritdoc
     */
    ngOnInit(): void {
        this.isMainScreen = !this.routerOutlet.canGoBack();
    }

    /**
     * Open User menu
     *
     * @param event Click event.
     */
    openUserMenu(event: Event): void {
        event.preventDefault();
        event.stopPropagation();

        CoreDomUtils.openSideModal<void>({
            component: CoreMainMenuUserMenuComponent,
        });
    }

    /**
     * Show User Tour.
     */
    async showTour(): Promise<void> {
        if (!this.avatar) {
            return;
        }

        await CoreUserTours.showIfPending({
            id: 'user-menu',
            component: CoreMainMenuUserMenuTourComponent,
            focus: this.avatar.nativeElement,
            alignment: CoreUserToursAlignment.Start,
            side: CoreScreen.isMobile ? CoreUserToursSide.Start : CoreUserToursSide.End,
        });
    }

}
