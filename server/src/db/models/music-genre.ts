import { DataType, Table, Model, Column, HasMany } from "sequelize-typescript";
import { MusicAlbum } from "./music-album";

@Table({
  tableName: "music_genres",
})
export class MusicGenre extends Model {
  @Column({
    primaryKey: true,
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare music_genre_id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare music_genre_name: string;

  @HasMany(() => MusicAlbum)
  declare albums: MusicAlbum[];
}
