import {Roms} from "../src";
import {ProjectTestModelConfig} from "./helpers/models/project-test";


const roms = new Roms()
roms.addModelConfigs([ProjectTestModelConfig]);

roms.use('projectTest').add([
    {id: 1, name: 'project-1', random: 30},
    {id: 2, name: 'project-2', random: 50},
    {id: 3, name: 'project-3', random: 20},
    {id: 4, name: 'project-4', random: 10},
    {id: 5, name: 'project-5', random: 40},
    {id: 6, name: 'project-6', random: 40},
    {id: 7, name: 'project-7', random: 40},
    {id: 8, name: 'project-8', random: 40},
    {id: 9, name: 'project-90', random: 40},
]);

test('order-by-observable', done => {

    let step = 0;
    let steps_taken = 0;

    let subscription = roms.use('projectTest')
        .orderBy('name', 'desc')
        .orderBy('random')
        .get()
        .subscribe((projects) => {

            switch (step) {
                case 0:
                    expect(projects).toMatchObject([
                        {id: 4, name: 'project-4', random: 10},
                        {id: 3, name: 'project-3', random: 20},
                        {id: 1, name: 'project-1', random: 30},
                        {id: 9, name: 'project-90', random: 40},
                        {id: 8, name: 'project-8', random: 40},
                        {id: 7, name: 'project-7', random: 40},
                        {id: 6, name: 'project-6', random: 40},
                        {id: 5, name: 'project-5', random: 40},
                        {id: 2, name: 'project-2', random: 50}

                    ]);
                    steps_taken ++;
                    break;
                case 1:
                    expect(projects).toMatchObject([
                        {id: 4, name: 'project-4', random: 10},
                        {id: 3, name: 'project-3', random: 20},
                        {id: 1, name: 'project-1', random: 30},
                        {id: 9, name: 'project-90', random: 40},
                        {id: 7, name: 'project-7', random: 40},
                        {id: 6, name: 'project-6', random: 40},
                        {id: 5, name: 'project-5', random: 40},
                        {id: 2, name: 'project-2', random: 50},
                        {id: 8, name: 'project-8', random: 500},
                    ]);
                    steps_taken ++;
                    break;
                case 2:
                    expect(projects).toMatchObject([
                        {id: 4, name: 'project-4', random: 10},
                        {id: 3, name: 'project-3', random: 20},
                        {id: 1, name: 'project-1', random: 30},
                        {id: 9, name: 'project-90', random: 40},
                        {id: 7, name: 'project-7', random: 40},
                        {id: 5, name: 'project-5', random: 40},
                        {id: 6, name: 'project-10', random: 40},
                        {id: 2, name: 'project-2', random: 50},
                        {id: 8, name: 'project-8', random: 500},
                    ]);
                    steps_taken ++;
                    break;
            }

        });

    step = 1;
    roms.use('projectTest').update({random: 500}, 8);

    step = 2;
    roms.use('projectTest').update({name: 'project-10'}, 6);

    expect(steps_taken).toBe(3);
    done();
    subscription.unsubscribe();
});


