import { apiUrls } from 'common/constants/api';

export type ApiUrls = typeof apiUrls;

export type ApiType = Exclude<keyof ApiUrls, 'root'>;

export type ApiUrl<Type extends ApiType> = Exclude<keyof ApiUrls[Type], 'root'> & string;
