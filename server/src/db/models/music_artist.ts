import { DataType, Table, Model, Column, HasMany } from "sequelize-typescript";
import { MusicAlbum } from "./music_album";
import { MusicTrack } from "./music_track";

@Table({
  tableName: "music_artists",
})
export class MusicArtist extends Model {
  @Column({
    primaryKey: true,
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare music_artist_id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare music_artist_name: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare music_artist_picture_small: string;

  @HasMany(() => MusicAlbum)
  declare albums: MusicAlbum[];

  @HasMany(() => MusicTrack)
  declare tracks: MusicTrack[];
}
