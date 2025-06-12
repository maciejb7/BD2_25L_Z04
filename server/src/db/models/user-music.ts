import {
  DataType,
  Table,
  Model,
  Column,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { User } from "./user";
import { MusicTrack } from "./music-track";

@Table({
  tableName: "user_music",
  indexes: [
    {
      unique: true,
      fields: ["user_id", "music_track_id"],
    },
  ],
})
export class UserMusic extends Model {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  declare user_music_id: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare user_id: string;

  @BelongsTo(() => User)
  declare user: User;

  @ForeignKey(() => MusicTrack)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare music_track_id: number;

  @BelongsTo(() => MusicTrack)
  declare track: MusicTrack;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  declare added_at: Date;
}
