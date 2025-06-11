import {
  DataType,
  Table,
  Model,
  Column,
  ForeignKey,
  BelongsTo,
  HasMany,
} from "sequelize-typescript";
import { MusicArtist } from "./music-artist";
import { MusicGenre } from "./music-genre";
import { MusicTrack } from "./music-track";

@Table({
  tableName: "music_albums",
})
export class MusicAlbum extends Model {
  @Column({
    primaryKey: true,
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare music_album_id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare music_album_title: string;

  @ForeignKey(() => MusicArtist)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare music_artist_id: number;

  @BelongsTo(() => MusicArtist)
  declare artist: MusicArtist;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare music_album_cover_small: string;

  @Column({
    type: DataType.DATEONLY,
    allowNull: true,
  })
  declare music_album_release_date: Date;

  @ForeignKey(() => MusicGenre)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare music_genre_id: number;

  @BelongsTo(() => MusicGenre)
  declare genre: MusicGenre;

  @HasMany(() => MusicTrack)
  declare tracks: MusicTrack[];
}
