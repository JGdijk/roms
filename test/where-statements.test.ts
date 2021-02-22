import {Roms} from "../src";
import {ProjectTestModelConfig} from "./helpers/models/project-test";


const roms = new Roms();
roms.addModelConfigs([ProjectTestModelConfig]);

roms.use('projectTest').add([
    {id: 1, name: 'project-1', random: 30},
    {id: 2, name: 'project-2', random: 50},
    {id: 3, name: 'project-3', random: 20},
    {id: 4, name: 'project-4', random: 10},
    {id: 5, name: 'project-5', random: 40},
    {id: 6, name: 'project-6', random: null},
    {id: 7, name: 'project-7'},
]);

test('basic-where-statements', () => {
    // strict no results
    let projects = roms.use('projectTest').where('id', '===', 8).getStatic();
    expect(projects.length).toBe(0);
    expect(projects).toMatchObject([]);

    // strict 1 result
    projects = roms.use('projectTest').where('id', '===', 1).getStatic();
    expect(projects.length).toBe(1);
    expect(projects).toMatchObject([
        {id: 1, name: 'project-1', random: 30}
    ]);

    // strict no results type difference
    projects = roms.use('projectTest').where('id', '===', '1').getStatic();
    expect(projects.length).toBe(0);
    expect(projects).toMatchObject([]);

    // loose 1 result
    projects = roms.use('projectTest').where('id', '==', '1').getStatic();
    expect(projects.length).toBe(1);
    expect(projects).toMatchObject([
        {id: 1, name: 'project-1', random: 30}
    ]);

    // gather than
    projects = roms.use('projectTest').where('random', '>', 30).getStatic();
    expect(projects.length).toBe(2);
    expect(projects).toMatchObject([
        {id: 2, name: 'project-2', random: 50},
        {id: 5, name: 'project-5', random: 40},
    ]);

    // gather or equal than
    projects = roms.use('projectTest').where('random', '>=', 30).getStatic();
    expect(projects.length).toBe(3);
    expect(projects).toMatchObject([
        {id: 1, name: 'project-1', random: 30},
        {id: 2, name: 'project-2', random: 50},
        {id: 5, name: 'project-5', random: 40},
    ]);

    // smaller or equal than
    projects = roms.use('projectTest').where('random', '<', 30).getStatic();
    expect(projects.length).toBe(3);
    expect(projects).toMatchObject([
        {id: 3, name: 'project-3', random: 20},
        {id: 4, name: 'project-4', random: 10},
        {id: 6, name: 'project-6', random: null},
    ]);

    // smaller or equal than
    projects = roms.use('projectTest').where('random', '<=', 30).getStatic();
    expect(projects.length).toBe(4);
    expect(projects).toMatchObject([
        {id: 1, name: 'project-1', random: 30},
        {id: 3, name: 'project-3', random: 20},
        {id: 4, name: 'project-4', random: 10},
        {id: 6, name: 'project-6', random: null},
    ]);

    // where between
    projects = roms.use('projectTest').whereBetween('random', 20, 40).getStatic();
    expect(projects.length).toBe(3);
    expect(projects).toMatchObject([
        {id: 1, name: 'project-1', random: 30},
        {id: 3, name: 'project-3', random: 20},
        {id: 5, name: 'project-5', random: 40},
    ]);

    // where not between
    projects = roms.use('projectTest').whereNotBetween('random', 20, 40).getStatic();
    expect(projects.length).toBe(3);
    expect(projects).toMatchObject([
        {id: 2, name: 'project-2', random: 50},
        {id: 4, name: 'project-4', random: 10},
        {id: 6, name: 'project-6', random: null},
    ]);

    // where empty
    projects = roms.use('projectTest').whereEmpty('random').getStatic();
    expect(projects.length).toBe(2);
    expect(projects).toMatchObject([
        {id: 6, name: 'project-6', random: null},
        {id: 7, name: 'project-7'}
    ]);

    // where not empty
    projects = roms.use('projectTest').whereNotEmpty('random').getStatic();
    expect(projects.length).toBe(5);
    expect(projects).toMatchObject([
        {id: 1, name: 'project-1', random: 30},
        {id: 2, name: 'project-2', random: 50},
        {id: 3, name: 'project-3', random: 20},
        {id: 4, name: 'project-4', random: 10},
        {id: 5, name: 'project-5', random: 40}
    ]);

    // where not exists
    projects = roms.use('projectTest').whereNotExists('random').getStatic();
    expect(projects.length).toBe(1);
    expect(projects).toMatchObject([
        {id: 7, name: 'project-7'}
    ]);

    // where exists
    projects = roms.use('projectTest').whereExists('random').getStatic();
    expect(projects.length).toBe(6);
    expect(projects).toMatchObject([
        {id: 1, name: 'project-1', random: 30},
        {id: 2, name: 'project-2', random: 50},
        {id: 3, name: 'project-3', random: 20},
        {id: 4, name: 'project-4', random: 10},
        {id: 5, name: 'project-5', random: 40},
        {id: 6, name: 'project-6', random: null}
    ]);

    // where in
    projects = roms.use('projectTest').whereIn('random', [20, 40]).getStatic();
    expect(projects.length).toBe(2);
    expect(projects).toMatchObject([
        {id: 3, name: 'project-3', random: 20},
        {id: 5, name: 'project-5', random: 40},
    ]);

    // where not in
    projects = roms.use('projectTest').whereNotIn('random', [20, 40]).getStatic();
    expect(projects.length).toBe(4);
    expect(projects).toMatchObject([
        {id: 1, name: 'project-1', random: 30},
        {id: 2, name: 'project-2', random: 50},
        {id: 4, name: 'project-4', random: 10},
        {id: 6, name: 'project-6', random: null}
    ]);

    // or where todo fix
    projects = roms.use('projectTest')
        .where('random', '=', 10)
        .orWhere('random', '=', 50)
        .getStatic();
    expect(projects.length).toBe(2);
    expect(projects).toMatchObject([
        {id: 2, name: 'project-2', random: 50},
        {id: 4, name: 'project-4', random: 10}
    ]);
});



