export type TSocketEventArgs<Map, Event extends keyof Map> = Map[Event] extends undefined ? [] : [Map[Event]];

export type TSocketEventMap<Map> = {
  [Event in keyof Map]: (...args: TSocketEventArgs<Map, Event>) => void;
};
