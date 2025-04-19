import {
  DataType,
  Table,
  Model,
  Column,
  ForeignKey,
  BelongsTo,
  HasMany,
} from "sequelize-typescript";
import { MusicAlbum } from "./music_album";
import { MusicArtist } from "./music_artist";
import { UserMusic } from "./user_music";

@Table({
  tableName: "music_tracks",
})
export class MusicTrack extends Model {
  @Column({
    primaryKey: true,
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare music_track_id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare music_track_title: string;

  @ForeignKey(() => MusicAlbum)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare music_album_id: number;

  @BelongsTo(() => MusicAlbum)
  declare album: MusicAlbum;

  @ForeignKey(() => MusicArtist)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare music_artist_id: number;

  @BelongsTo(() => MusicArtist)
  declare artist: MusicArtist;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare music_track_preview_link: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare music_track_deezer_link: string;

  @HasMany(() => UserMusic)
  declare users: UserMusic[];
}
