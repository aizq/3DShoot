export default class EnemyObj {
    public id: number = 0;
    public name: string = "";
    public radius: number = 0.0;
    public life: number = 0.0;
    public walk_speed: number = 0.0;
    public run_speed: number = 0.0;
    public attack_range: number = 0.0;
    public move_range: number = 0.0;
    public ck_sight_frq: number = 0.0;
    public sight_range: number = 0.0;
    public sight_angle: number = 0.0;
    public scream_time: number = 0.0;
    public attack_time: number = 0.0;
    public death_time: number = 0.0;
    public alarm_range: number = 0.0;
}
export const EnemyData: MAny = { "0": { "id": 0, "name": "bald", "radius": 0.5, "life": 6.0, "walk_speed": 0.6, "run_speed": 4.5, "attack_range": 1.0, "move_range": 4.0, "ck_sight_frq": 1.0, "sight_range": 10.0, "sight_angle": 15.0, "scream_time": 1.5, "attack_time": 2.63, "death_time": 2.6, "alarm_range": 2.5 }, "1": { "id": 1, "name": "devils", "radius": 0.5, "life": 10.0, "walk_speed": 0.6, "run_speed": 4.5, "attack_range": 1.0, "move_range": 4.0, "ck_sight_frq": 1.0, "sight_range": 10.0, "sight_angle": 15.0, "scream_time": 1.5, "attack_time": 2.63, "death_time": 2.6, "alarm_range": 2.5 } }