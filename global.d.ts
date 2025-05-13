// Type definition for nhentai-api
declare module 'nhentai-api' {
  export enum TagTypes {
    Tag = 'tag',
    Category = 'category',
    Artist = 'artist',
    Parody = 'parody',
    Character = 'character',
    Group = 'group',
    Language = 'language'
  }

  export interface TagType {
    id: number;
    type: string;
  }

  export interface Tag {
    id: number;
    type: TagType;
    name: string;
    url: string;
    count: number;
  }

  export interface BookTitle {
    english?: string;
    japanese?: string;
    pretty?: string;
  }

  export interface ImageMeta {
    t: string;  // Type (j: jpg, p: png, g: gif)
    w: number;  // Width
    h: number;  // Height
  }

  export interface Book {
    id: number;
    mediaId: number;
    title: string | BookTitle;
    numPages: number;
    favorites: number;
    uploadDate: Date;
    cover: ImageMeta;
    thumbnail: ImageMeta;
    pages: ImageMeta[];
    tags: Tag[];
    artists: string[];
    categories: string[];
    languages: string[];
    characters: string[];
    groups: string[];
    parodies: string[];
    pureTags: string[];
  }

  export interface SearchResult {
    books: Book[];
    pages: number;
    perPage: number;
  }

  export class API {
    constructor();
    
    // Book methods
    getBook(id: number): Promise<Book>;
    getBooksById(ids: number[]): Promise<Book[]>;
    
    // Search methods
    search(text: string, page?: number): Promise<SearchResult>;
    searchByTag(tag: string, page?: number): Promise<SearchResult>;
    searchByTagId(tagId: number, page?: number): Promise<SearchResult>;
    searchByCategory(category: string, page?: number): Promise<SearchResult>;
    searchByArtist(artist: string, page?: number): Promise<SearchResult>;
    searchByParody(parody: string, page?: number): Promise<SearchResult>;
    searchByCharacter(character: string, page?: number): Promise<SearchResult>;
    searchByGroup(group: string, page?: number): Promise<SearchResult>;
    searchTagged(tag: string, type: TagTypes | string, page?: number): Promise<SearchResult>;
    
    // Random
    getRandomBook(): Promise<Book>;
    
    // Utility
    getBookTags(book: Book): Tag[];
    filterTags(tags: Tag[], type: TagTypes | string): Tag[];
  }
} 