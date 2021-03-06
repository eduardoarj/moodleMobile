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

import { Component, ElementRef, Input, OnInit } from '@angular/core';
import {
    CoreCourseModuleCompletionStatus,
    CoreCourseModuleCompletionTracking,
    CoreCourseProvider,
} from '@features/course/services/course';
import { CoreCourseHelper, CoreCourseSection } from '@features/course/services/course-helper';
import { CoreCourseFormatDelegate } from '@features/course/services/format-delegate';
import { CoreCourseAnyCourseData } from '@features/courses/services/courses';
import { ModalController } from '@singletons';
import { CoreDom } from '@singletons/dom';

/**
 * Component to display course index modal.
 */
@Component({
    selector: 'core-course-course-index',
    templateUrl: 'course-index.html',
    styleUrls: ['course-index.scss'],
})
export class CoreCourseCourseIndexComponent implements OnInit {

    @Input() sections: CoreCourseSection[] = [];
    @Input() selectedId?: number;
    @Input() course?: CoreCourseAnyCourseData;

    allSectionId = CoreCourseProvider.ALL_SECTIONS_ID;
    highlighted?: string;
    sectionsToRender: CourseIndexSection[] = [];

    constructor(
        protected elementRef: ElementRef,
    ) {
    }

    /**
     * @inheritdoc
     */
    async ngOnInit(): Promise<void> {
        if (!this.course || !this.sections) {
            this.closeModal();

            return;
        }

        let completionEnabled = !!this.course.enablecompletion;
        if (completionEnabled && 'completionusertracked' in this.course && this.course.completionusertracked !== undefined) {
            completionEnabled = this.course.completionusertracked;
        }
        if (completionEnabled && 'showcompletionconditions' in this.course && this.course.showcompletionconditions !== undefined) {
            completionEnabled = this.course.showcompletionconditions;
        }

        const currentSectionData = await CoreCourseFormatDelegate.getCurrentSection(this.course, this.sections);

        if (this.selectedId === undefined) {
            // Highlight current section if none is selected.
            this.selectedId = currentSectionData.section.id;
        }

        // Clone sections to add information.
        this.sectionsToRender = this.sections
            .filter((section) => !CoreCourseHelper.isSectionStealth(section))
            .map((section) => {
                const modules = section.modules
                    .filter((module) => !CoreCourseHelper.isModuleStealth(module, section) && !module.noviewlink)
                    .map((module) => {
                        const completionStatus = !completionEnabled || module.completiondata === undefined ||
                        module.completiondata.tracking == CoreCourseModuleCompletionTracking.COMPLETION_TRACKING_NONE
                            ? undefined
                            : module.completiondata.state;

                        return {
                            id: module.id,
                            name: module.name,
                            course: module.course,
                            visible: !!module.visible,
                            uservisible: CoreCourseHelper.canUserViewModule(module, section),
                            completionStatus,
                        };
                    });

                return {
                    id: section.id,
                    name: section.name,
                    availabilityinfo: !!section.availabilityinfo,
                    visible: !!section.visible,
                    uservisible: CoreCourseHelper.canUserViewSection(section),
                    expanded: section.id === this.selectedId,
                    highlighted: currentSectionData.section.id === section.id,
                    hasVisibleModules: modules.length > 0,
                    modules: modules,
                };
            });

        this.highlighted = CoreCourseFormatDelegate.getSectionHightlightedName(this.course);

        CoreDom.scrollToElement(
            this.elementRef.nativeElement,
            '.item.item-current',
            { addYAxis: -10 },
        );
    }

    /**
     * Toggle expand status.
     *
     * @param event Event object.
     * @param section Section to expand / collapse.
     */
    toggleExpand(event: Event, section: CourseIndexSection): void {
        section.expanded = !section.expanded;
        event.stopPropagation();
        event.preventDefault();
    }

    /**
     * Close the modal.
     */
    closeModal(): void {
        ModalController.dismiss();
    }

    /**
     * Select a section.
     *
     * @param event Event.
     * @param sectionId Selected section id.
     * @param moduleId Selected module id, if any.
     */
    selectSectionOrModule(event: Event, sectionId: number, moduleId?: number): void {
        ModalController.dismiss({ event, sectionId, moduleId });
    }

}

type CourseIndexSection = {
    id: number;
    name: string;
    highlighted: boolean;
    expanded: boolean;
    hasVisibleModules: boolean;
    availabilityinfo: boolean;
    visible: boolean;
    uservisible: boolean;
    modules: {
        id: number;
        course: number;
        visible: boolean;
        uservisible: boolean;
        completionStatus?: CoreCourseModuleCompletionStatus;
    }[];
};

export type CoreCourseIndexSectionWithModule = {
    event: Event;
    sectionId: number;
    moduleId?: number;
};
