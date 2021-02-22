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

roms.use('projectTest').add([
    {id: 1, name: 'project-1', tasks: [
            {task_id: 1, name: 'task-1'},
            {task_id: 2, name: 'task-2'},
            {task_id: 3, name: 'task-3'},
            {task_id: 4, name: 'task-4'}
        ]},
    {id: 2, name: 'project-2'},
    {id: 3, name: 'project-3'}
]);

// counting the amount of objects.
test('get', done => {
    let subscription = roms.use('projectTest').get().subscribe((projects) => {
        expect(projects.length).toBe(3);
        done();
    });
    subscription.unsubscribe();
});

// counting the amount of projects when fetched statically.
test('static-get', () => {
    expect(roms.use('projectTest').getStatic().length).toBe(3);
});

// adding an object before initiating.
test('single-add', done => {
    roms.use('projectTest').add({id: 4, name: 'project-4'});
    let subscription = roms.use('projectTest').get().subscribe((projects) => {
        expect(projects.length).toBe(4);
        done();
    });
    subscription.unsubscribe();
});

// removing an object before initiating.
test('single-remove', done => {
    roms.use('projectTest').remove(4);
    let subscription = roms.use('projectTest').get().subscribe((projects) => {
        expect(projects.length).toBe(3);
        done();
    });
    subscription.unsubscribe();
});

// updating an object before initiating.
test('single-update', done => {
    roms.use('projectTest').where('id', '===', 1).update({name: 'update-test'});
    let subscription = roms.use('projectTest').get().subscribe((projects: ProjectTest[]) => {
        expect(projects[0].name).toBe('update-test');
        done();
    });
    subscription.unsubscribe();
});
