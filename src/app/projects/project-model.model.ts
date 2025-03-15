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
    title: SafeHtml;
    tabTitle: string;
    subsections: ProjectSubSection[];
}

export interface ProjectSubSection {
    pageSection: string;    
    content: SafeHtml;
    listItems? : ListItem[];
    imgs?: string[];
    code?: SafeHtml;
    groovy?: SafeHtml;
    yaml?: SafeHtml;
    bash?: SafeHtml;
    json?: SafeHtml;
}

export interface ListItem {
    text: SafeHtml;
    subList?: SafeHtml[];
}