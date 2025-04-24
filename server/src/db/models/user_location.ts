import {
    Table,
    Model,
    Column,
    DataType,
    ForeignKey,
    BelongsTo,
} from "sequelize-typescript";
import { User } from "./user";

@Table({
    tableName: "user_locations",
})
export class UserLocation extends Model {
    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    declare location_id: string;

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        allowNull: false,
        unique: true,
    })
    declare user_id: string;

    @BelongsTo(() => User)
    declare user: User;

    @Column({
        type: DataType.FLOAT,
        allowNull: false,
    })
    declare latitude: number;

    @Column({
        type: DataType.FLOAT,
        allowNull: false,
    })
    declare longitude: number;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare address: string;
}