export interface Project {
    id: string;
    title: string;
    subtitle: string;
    github: string;
    description: string;
    overview: string;
    titleImage: string;
    sections: ProjectSections[];
    summary: string;
    summaryImg?: string;
}

export interface ProjectSections {
    title: string;
    tabTitle: string;
    subsections: ProjectSubSection[];
}

export interface ProjectSubSection {
    content: string;
    listItems? : string[];
    imgs?: string[];
}