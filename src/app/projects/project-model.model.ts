import { SafeHtml } from "@angular/platform-browser";

export interface Project {
    id: string;
    title: string;
    subtitle: string;
    github: string;
    description: string;
    // overview: string;
    listIcon?: string[];
    titleIcons?: string[];
    // titleImage: string;
    sections: ProjectSections[];
    // summary: string;
    // summaryImg?: string;
}

export interface ProjectSections {
    title: string;
    tabTitle: string;
    subsections: ProjectSubSection[];
}

export interface ProjectSubSection {
    content: SafeHtml;
    listItems? : ListItem[];
    imgs?: string[];
    code?: SafeHtml;
}

export interface ListItem {
    text: SafeHtml;
    subList?: SafeHtml[];
}