import {ProjectTest, ProjectTestModelConfig} from "./helpers/models/project-test";
import {Roms} from "../src";


const roms = new Roms();
roms.addModelConfigs([ProjectTestModelConfig]);


roms.use('projectTest').add([
    {id: 1, name: 'project-1'},
    {id: 2, name: 'project-2'},
    {id: 3, name: 'project-3'}
]);


test('model', done => {
    let p;

    let step = 0;
    let step1_taken = 0;


    let subscription = roms.use('projectTest').get().subscribe((projects) => {
        step1_taken ++;
        p = projects;

        expect(projects.length).toBe(3);

        switch (step) {
            case 0:
                expect(projects).toMatchObject([
                    {id: 1, name: 'project-1'},
                    {id: 2, name: 'project-2'},
                    {id: 3, name: 'project-3'}
                ]);
                break;
            case 1:
                expect(projects).toMatchObject([
                    {id: 1, name: 'test'},
                    {id: 2, name: 'project-2'},
                    {id: 3, name: 'project-3'}
                ]);
                break;
        }


    });

    step = 1;
    // @ts-ignore
    p[0].update({name:'test'});

    expect(step1_taken).toBe(2);

    done();
    subscription.unsubscribe();
});

// test('model-function-inheritance', () => {
//     expect(roms.use('projectTest').findStatic(1).testFunction()).toBe('test');
// });

