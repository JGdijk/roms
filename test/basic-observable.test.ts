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
    {id: 1, name: 'project-1'},
    {id: 2, name: 'project-2'},
    {id: 3, name: 'project-3'}
]);


test('simple-add-observable', done => {

    let step = 0;
    let steps_taken = 0;

    let subscription = roms.use('projectTest').get().subscribe((projects) => {

        switch(step) {
            case 0:
                steps_taken ++;
                expect(projects.length).toBe(3);
                expect(projects).toMatchObject([
                    {id: 1, name: 'project-1'},
                    {id: 2, name: 'project-2'},
                    {id: 3, name: 'project-3'}
                ]);
                break;
            case 1:
                steps_taken ++;
                expect(projects.length).toBe(4);
                expect(projects).toMatchObject([
                    {id: 1, name: 'project-1'},
                    {id: 2, name: 'project-2'},
                    {id: 3, name: 'project-3'},
                    {id: 4, name: 'project-4'}
                ]);
                break;
            case 2:
                steps_taken ++;
                expect(projects.length).toBe(4);
                expect(projects).toMatchObject([
                    {id: 1, name: 'project-1a'},
                    {id: 2, name: 'project-2'},
                    {id: 3, name: 'project-3'},
                    {id: 4, name: 'project-4'}
                ]);
                break;
            case 3:
                steps_taken ++;
                expect(projects.length).toBe(4);
                expect(projects).toMatchObject([
                    {id: 1, name: 'project-1a'},
                    {id: 2, name: 'project-2'},
                    {id: 3, name: 'project-3'},
                    {id: 4, name: 'project-4a'}
                ]);
                break;
            case 4:
                steps_taken ++;
                expect(projects.length).toBe(4);
                expect(projects).toMatchObject([
                    {id: 1, name: 'project-1a'},
                    {id: 2, name: 'similar_name'},
                    {id: 3, name: 'similar_name'},
                    {id: 4, name: 'project-4a'}
                ]);
                break;
            case 5:
                steps_taken ++;
                expect(projects.length).toBe(3);
                expect(projects).toMatchObject([
                    {id: 2, name: 'similar_name'},
                    {id: 3, name: 'similar_name'},
                    {id: 4, name: 'project-4a'}
                ]);
                break;
            case 6:
                steps_taken ++;
                expect(projects.length).toBe(0);
                break;
            case 7:
                steps_taken ++;
                expect(projects.length).toBe(4);
                expect(projects).toMatchObject([
                    {id: 1, name: 'project-1'},
                    {id: 2, name: 'project-2'},
                    {id: 3, name: 'project-3'},
                    {id: 4, name: 'project-4'}
                ]);
        }

    });

    step = 1;
    roms.use('projectTest').add({id: 4, name: 'project-4'});

    step = 2;
    roms.use('projectTest').where('id', '===', 1).update({name: 'project-1a'});

    step = 3;
    roms.use('projectTest').where('id', '===', 4).update({name: 'project-4a'});

    step = 4;
    roms.use('projectTest').whereBetween('id', 2, 3).update({name: 'similar_name'});

    step = 5;
    roms.use('projectTest').remove(1);

    step = 6;
    roms.use('projectTest').remove([2,3,4]);


    step = 7;
    roms.hold();
    roms.use('projectTest').add({id: 1, name: 'project-1'});
    roms.use('projectTest').add({id: 2, name: 'project-2'});
    roms.use('projectTest').add({id: 3, name: 'project-3'});
    roms.use('projectTest').add({id: 4, name: 'project-4'});
    roms.continue();

    expect(steps_taken).toBe(8);

    done();
    subscription.unsubscribe();
});
