import {Roms} from "../src";
import {ProjectTest, ProjectTestModelConfig} from "./helpers/models/project-test";
import {TaskTestModelConfig} from "./helpers/models/task-test";
import {UserTestModelConfig} from "./helpers/models/user-test";


const roms = new Roms();
roms.addModelConfigs([
    ProjectTestModelConfig,
    TaskTestModelConfig,
    UserTestModelConfig
])

roms.use('taskTest').add([
    {task_id: 5, name: 'task-5'}
]);

roms.use('projectTest').add([
    {id: 1, name: 'project-1', tasks: [
            {task_id: 1, name: 'task-1'},
            {task_id: 2, name: 'task-2'},
            {task_id: 3, name: 'task-3'},
            {task_id: 4, name: 'task-4'}
        ]},
    {id: 2, name: 'project-2'},
    {id: 3, name: 'project-3'}
])

test('simple-relation-observable', done => {

    let step = 0;
    let steps_taken = 0;

    let subscription = roms.use('projectTest').with('tasks').get().subscribe((projects) => {
        switch(step) {
            case 0:
                steps_taken ++;
                expect(projects.length).toBe(3);
                expect(projects[0].tasks.length).toBe(4);
                expect(projects[0].tasks).toMatchObject([
                    {task_id: 1, name: 'task-1'},
                    {task_id: 2, name: 'task-2'},
                    {task_id: 3, name: 'task-3'},
                    {task_id: 4, name: 'task-4'}
                ]);
                break;
            case 1:
                steps_taken ++;
                expect(projects.length).toBe(3);
                expect(projects[0].tasks.length).toBe(3);
                expect(projects[0].tasks).toMatchObject([
                    {task_id: 1, name: 'task-1'},
                    {task_id: 3, name: 'task-3'},
                    {task_id: 4, name: 'task-4'}
                ]);
                break;
            case 2:
                steps_taken ++;
                expect(projects.length).toBe(3);
                expect(projects[0].tasks.length).toBe(4);
                expect(projects[0].tasks[3]).toMatchObject({task_id: 5, name: 'task-5'});
                break;
            case 3:
                steps_taken ++;
                expect(projects.length).toBe(3);
                expect(projects[0].tasks.length).toBe(2);


                step = 4;
                projects[0].addRelation('tasks',   {task_id: 99, name: 'task-99'})
                break;
            case 4:
                steps_taken ++;
                expect(projects[0].tasks.length).toBe(3);
                expect(projects[0].tasks[2]).toMatchObject({task_id: 99, name: 'task-99'});
        }
    });

    step = 1;
    roms.use('taskTest').remove(2);

    step = 2;
    roms.use('projectTest').attach(1,'tasks', 5);

    step = 3;
    roms.use('projectTest').detach(1, 'tasks', [3,4]);

    expect(steps_taken).toBe(5);
    done();
    subscription.unsubscribe();

});
