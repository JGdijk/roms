import {Roms} from "../src";
import {AddressTestModelConfig} from "./helpers/models/address-test";
import {ProjectTestModelConfig} from "./helpers/models/project-test";
import {TaskTestModelConfig} from "./helpers/models/task-test";
import {UserTestModelConfig} from "./helpers/models/user-test";
import {JoinCallback} from "../src/query/statements/join/statements/callback/join-callback"; // todo should be from src
import {WhereHasStatementCallback} from "../src/query/statements/where/statements/callback/where-has/where-has-statement-callback";
import {WhereDoesntHaveStatementCallback} from "../src/query/statements/where/statements/callback/where-doesnt-have/where-doesnt-have-statement-callback"; // todo should be from src

const roms = new Roms();
roms.addModelConfigs([
    AddressTestModelConfig,
    ProjectTestModelConfig,
    TaskTestModelConfig,
    UserTestModelConfig
]);

roms.use('projectTest').add([
    {id: 1, name: 'project-1', tasks: [
            {task_id: 1, name: 'task-1', random: 300},
            {task_id: 2, name: 'task-2', random: 100, users: [
                    {id: 1, name: 'user-1', random: 20, address: {
                            id: 1, name: 'straat1'
                        }
                    },
                    {id: 2, name: 'user-2', random: 10},
                    {id: 3, name: 'user-3', random: 50}
                ]},
            {task_id: 3, name: 'task-3', random: 500},
            {task_id: 4, name: 'task-4', random: 200, users: [
                    {id: 10, name: 'user-10', random: 2},
                    {id: 11, name: 'user-11', random: 1},
                    {id: 12, name: 'user-12', random: 5}
                ]}
        ]},
    {id: 2, name: 'project-2'},
    {id: 3, name: 'project-3'}
]);

roms.use('taskTest').add([
    {task_id: 5, name: 'task-5'}
]);


test('complex-relation-where-has', done => {

    let step = 0;
    let steps_taken = 0;

    let subscription = roms.use('projectTest')
        .with('tasks', (joinTaskCallback: JoinCallback) => {
            joinTaskCallback
                .with('users', (joinUsersCallback: JoinCallback) => {
                    joinUsersCallback.orderBy('random');
                    joinUsersCallback.with('address');
                })
                .orderBy('random', 'desc')
                .whereHas('users', (whereHasUsersCallback: WhereHasStatementCallback) => {
                    whereHasUsersCallback.where('random', '>', 5);
                })
        })
        .get()
        .subscribe((projects) => {

            steps_taken ++;

            switch(step) {
                case 0:
                    expect(projects.length).toBe(3);
                    expect(projects[0].tasks.length).toBe(1);
                    expect(projects).toMatchObject([
                        {id: 1, name: 'project-1', tasks: [
                                {task_id: 2, name: 'task-2', random: 100, users: [
                                        {id: 2, name: 'user-2', random: 10},
                                        {id: 1, name: 'user-1', random: 20 , address: {
                                                id: 1, name: 'straat1'
                                            }},
                                        {id: 3, name: 'user-3', random: 50}
                                    ]},
                            ]},
                        {id: 2, name: 'project-2', tasks: []},
                        {id: 3, name: 'project-3', tasks: []}
                    ]);
                    break;
                case 1:
                    expect(projects.length).toBe(3);
                    expect(projects[0].tasks.length).toBe(2);
                    expect(projects).toMatchObject([
                        {id: 1, name: 'project-1', tasks: [
                                {task_id: 4, name: 'task-4', random: 200, users: [
                                        {id: 11, name: 'user-11', random: 1},
                                        {id: 12, name: 'user-12', random: 5},
                                        {id: 10, name: 'user-10', random: 50},
                                    ]},
                                {task_id: 2, name: 'task-2', random: 100, users: [
                                        {id: 2, name: 'user-2', random: 10},
                                        {id: 1, name: 'user-1', random: 20, address: {
                                                id: 1, name: 'straat1'
                                            } },
                                        {id: 3, name: 'user-3', random: 50}
                                    ]},
                            ]},
                        {id: 2, name: 'project-2', tasks: []},
                        {id: 3, name: 'project-3', tasks: []}
                    ]);
                    break;
                case 2:
                    expect(projects.length).toBe(3);
                    expect(projects[0].tasks.length).toBe(1);
                    expect(projects).toMatchObject([
                        {id: 1, name: 'project-1', tasks: [
                                {task_id: 2, name: 'task-2', random: 100, users: [
                                        {id: 2, name: 'user-2', random: 10},
                                        {id: 1, name: 'user-1', random: 20, address: {
                                                id: 1, name: 'straat1'
                                            }},
                                        {id: 3, name: 'user-3', random: 50}
                                    ]},
                            ]},
                        {id: 2, name: 'project-2', tasks: []},
                        {id: 3, name: 'project-3', tasks: []}
                    ]);
                    break;
                case 3:
                    expect(projects.length).toBe(3);
                    expect(projects[0].tasks.length).toBe(2);
                    expect(projects).toMatchObject([
                        {id: 1, name: 'project-1', tasks: [
                                {task_id: 4, name: 'task-4', random: 200, users: [
                                        {id: 11, name: 'user-11', random: 1},
                                        {id: 12, name: 'user-12', random: 5},
                                        {id: 20, name: 'user-20', random: 500},
                                    ]},
                                {task_id: 2, name: 'task-2', random: 100, users: [
                                        {id: 2, name: 'user-2', random: 10},
                                        {id: 1, name: 'user-1', random: 20, address: {
                                                id: 1, name: 'straat1'
                                            }},
                                        {id: 3, name: 'user-3', random: 50 }
                                    ]},
                            ]},
                        {id: 2, name: 'project-2', tasks: []},
                        {id: 3, name: 'project-3', tasks: []}
                    ]);
                    break;
                case 4:
                    expect(projects.length).toBe(3);
                    expect(projects[0].tasks.length).toBe(2);
                    expect(projects).toMatchObject([
                        {id: 1, name: 'project-1', tasks: [
                                {task_id: 4, name: 'task-4', random: 200, users: [
                                        {id: 11, name: 'user-11', random: 1},
                                        {id: 12, name: 'user-12', random: 5},
                                        {id: 20, name: 'user-20', random: 500},
                                    ]},
                                {task_id: 2, name: 'task-2', random: 100, users: [
                                        {id: 2, name: 'user-2', random: 10},
                                        {id: 1, name: 'user-1', random: 20, address: {
                                                id: 1, name: 'straat2'
                                            }},
                                        {id: 3, name: 'user-3', random: 50 }
                                    ]},
                            ]},
                        {id: 2, name: 'project-2', tasks: []},
                        {id: 3, name: 'project-3', tasks: []}
                    ]);
                    break;
            }
        });

    step = 1;
    roms.use('userTest').update({random: 50}, 10);

    step = 2;

    roms.use('taskTest').detach(4, 'users', 10);


    step = 3;

    roms.use('userTest').add({id: 20, name: 'user-20', random: 500});
    roms.use('taskTest').attach(4, 'users', 20);

    step = 4;
    roms.use('addressTest').update({name: 'straat2'}, 1);


    expect(steps_taken).toBe(5);
    done();
    subscription.unsubscribe();
});

const roms2 = new Roms();
roms2.addModelConfigs([
    AddressTestModelConfig,
    ProjectTestModelConfig,
    TaskTestModelConfig,
    UserTestModelConfig
]);

roms2.use('projectTest').add([
    {id: 1, name: 'project-1', tasks: [
            {task_id: 1, name: 'task-1', random: 300},
            {task_id: 2, name: 'task-2', random: 100, users: [
                    {id: 1, name: 'user-1', random: 20},
                    {id: 2, name: 'user-2', random: 1},
                ]},
            {task_id: 3, name: 'task-3', random: 500},
            {task_id: 4, name: 'task-4', random: 200, users: [
                    {id: 10, name: 'user-10', random: 2},
                ]}
        ]},
    {id: 2, name: 'project-2'},
    {id: 3, name: 'project-3'}
]);

roms2.use('taskTest').add([
    {task_id: 5, name: 'task-5'}
]);

test('complex-relation-where-doesnt-have', done => {

    let step = 0;
    let steps_taken = 0;

    let subscription = roms2.use('projectTest')
        .with('tasks', (joinTaskCallback: JoinCallback) => {
            joinTaskCallback
                .with('users')
                .orderBy('random', 'desc')
                .whereDoesntHave('users', (whereHasUsersCallback: WhereDoesntHaveStatementCallback) => {
                    whereHasUsersCallback.where('random', '>', 5);
                })
        })
        .get()
        .subscribe((projects) => {
            steps_taken ++;
            switch(step) {
                case 0:
                    expect(projects.length).toBe(3);
                    expect(projects[0].tasks.length).toBe(3);
                    expect(projects).toMatchObject([
                        {id: 1, name: 'project-1', tasks: [
                                {task_id: 3, name: 'task-3', random: 500, users: []},
                                {task_id: 1, name: 'task-1', random: 300, users: []},
                                {task_id: 4, name: 'task-4', random: 200, users: [
                                        {id: 10, name: 'user-10', random: 2},
                                    ]}
                            ]},
                        {id: 2, name: 'project-2', tasks: []},
                        {id: 3, name: 'project-3', tasks: []}
                    ]);
                    break;
                case 1:
                    expect(projects.length).toBe(3);
                    expect(projects[0].tasks.length).toBe(2);
                    expect(projects).toMatchObject([
                        {id: 1, name: 'project-1', tasks: [
                                {task_id: 3, name: 'task-3', random: 500, users: []},
                                {task_id: 1, name: 'task-1', random: 300, users: []}
                            ]},
                        {id: 2, name: 'project-2', tasks: []},
                        {id: 3, name: 'project-3', tasks: []}
                    ]);
                    break;
                case 2:
                    expect(projects.length).toBe(3);
                    expect(projects[0].tasks.length).toBe(3);
                    expect(projects).toMatchObject([
                        {id: 1, name: 'project-1', tasks: [
                                {task_id: 3, name: 'task-3', random: 500, users: []},
                                {task_id: 1, name: 'task-1', random: 300, users: []},
                                {task_id: 4, name: 'task-4', random: 200, users: []}
                            ]},
                        {id: 2, name: 'project-2', tasks: []},
                        {id: 3, name: 'project-3', tasks: []}
                    ]);
                    break;
                case 3:
                    expect(projects.length).toBe(3);
                    expect(projects[0].tasks.length).toBe(2);
                    expect(projects).toMatchObject([
                        {id: 1, name: 'project-1', tasks: [
                                {task_id: 3, name: 'task-3', random: 500, users: []},
                                {task_id: 1, name: 'task-1', random: 300, users: []}
                            ]},
                        {id: 2, name: 'project-2', tasks: []},
                        {id: 3, name: 'project-3', tasks: []}
                    ]);
                    break;
                case 4:
                    expect(projects.length).toBe(3);
                    expect(projects[0].tasks.length).toBe(2);
                    expect(projects).toMatchObject([
                        {id: 1, name: 'project-1', tasks: [
                                {task_id: 3, name: 'task-3', random: 500, users: []},
                                {task_id: 1, name: 'task-1', random: 300, users: [
                                        {id: 21, name: 'user-21', random: 4}
                                    ]}
                            ]},
                        {id: 2, name: 'project-2', tasks: []},
                        {id: 3, name: 'project-3', tasks: []}
                    ]);
                    break;

            }
        });

    step = 1;
    roms2.use('userTest').update({random: 50}, 10);

    step = 2;
    roms2.use('taskTest').detach(4, 'users', 10);
    //
    step = 3;
    roms2.use('userTest').add({id: 20, name: 'user-20', random: 500});
    roms2.use('taskTest').attach(4, 'users', 20);

    step = 4;
    roms2.use('userTest').add({id: 21, name: 'user-21', random: 4});
    roms2.use('taskTest').attach(1, 'users', 21);

    expect(steps_taken).toBe(5);
    done();
    subscription.unsubscribe();
});
