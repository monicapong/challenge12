const mysql = require('mysql2');
const inquirer = require('inquirer');

const connection = mysql.createConnection(
    {
        host: 'localhost',
        port: '8889',
        user: 'root',
        password: 'root',
        database: 'employee_tracker_db'
    }
);

const menuPromt = () => {
    inquirer.prompt ({
        type: 'list',
        name: 'menu',
        message: 'What would you like to do?',
        choices: [
            'View all employees',
            'Add employee',
            'Update employee role',
            'View all roles',
            'Add role',
            'View all departments',
            'Add department',
            'Quit'
        ]
    }).then((response) => {
        if (response.menu === 'View all employees') {
            viewEmployees();
        } else if (response.menu === 'Add employee') {
            addEmployee();
        } else if (response.menu === 'Update employee role') {
            updateRole();
        } else if (response.menu === 'View all roles') {
            viewRoles();
        } else if (response.menu === 'Add role') {
            addRole();
        } else if (response.menu === 'View all departments') {
            viewDepartments();
        } else if (response.menu === 'Add department') {
            addDepartment();
        } else {
            connection.end();
        }

    });
};


menuPromt();

const viewEmployees = () => {
    connection.query(`SELECT employee.id, employee.first_name, employee.last_name, role.title , role.salary, department.name, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employee
    LEFT JOIN role ON role.id = employee.role_id
    JOIN department ON department.id = role.department_id
    LEFT JOIN employee AS manager ON manager.id = employee.manager_id
    ORDER BY employee.id`, (error, data) => {
        if (error) {
            console.log(error);
        } else {
            console.table(data);
            menuPromt();
        };
    });
};

const addEmployee = () => {
    let allRoles = [];
    connection.query('SELECT * FROM role', (error, data) => {
        if (error) {
            console.log(error);
        } else {
            for (let i = 0; i < data.length; i++) {
                allRoles.push(data[i].id + ' ' + data[i].title);
            };
        };
    });

    let allEmployees= ['0 None'];
    connection.query('SELECT * FROM employee', (error, data) => {
        if (error) {
            console.log(error);
        } else {
            for (let i = 0; i < data.length; i++) {
                allEmployees.push(data[i].id + ' ' + data[i].first_name + ' ' + data[i].last_name);
            };
        };
    });

    inquirer.prompt([
        {
            type: 'input',
            name: 'first_name',
            message: `What is the employee's first name?`
        },
        {
            type: 'input',
            name: 'last_name',
            message: `What is the employee's last name?`
        },
        {
            type: 'list',
            name: 'role',
            message: `What is the employee's role?`,
            choices: allRoles
        },
        {
            type: 'list',
            name: 'manager',
            message: `Who is the employee's manager?`,
            choices: allEmployees

        }
    ]).then((response) => {
        if (response.manager === '0 None') {
            connection.query(`INSERT INTO employee (first_name, last_name, role_id)
            VALUES (?, ?, ?) ['${response.first_name}', '${response.last_name}', '${response.role[0]}'];`, (err, data) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log(`Added ${response.first_name} ${response.last_name} to the database`);
                    menuPromt();
                };
            });
        } else {
            connection.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id)
            VALUES ('${response.first_name}', '${response.last_name}', '${response.role[0]}', '${response.manager[0]}');`, (error, data) => {
                if (error) {
                    console.log(error);
                } else {
                    console.log(`Added ${response.first_name} ${response.last_name} to the database`);
                    menuPromt();
                };
            });
        };
    });
};

const updateRole = () => {
    let allRoles = [];
    connection.query('SELECT * FROM role', (error, data) => {
        if (error) {
            console.log(error);
        } else {
            for (let i = 0; i < data.length; i++) {
                allRoles.push(data[i].id + ' ' + data[i].title);
            };
            let allEmployees = [];
            connection.query('SELECT * FROM employee', (error, data) => {
                if (error) {
                    console.log(error);
                } else {
                    for (let i = 0; i < data.length; i++) {
                        allEmployees.push(data[i].id + ' ' + data[i].first_name + ' ' + data[i].last_name);
                    };

                    inquirer.prompt([
                        {
                            type: 'list',
                            name: 'employee',
                            message: `Which employee's role do you want to update?`,
                            choices: allEmployees
                        },
                        {
                            type: 'list',
                            name: 'role',
                            message: `Which role do you want to assign the selected employee?`,
                            choices: allRoles
                        }
                    ]).then((response) => {
                        connection.query(`UPDATE employee SET role_id = ${response.role[0]} WHERE id = ${response.employee[0]}`, (error, data) => {
                            if (error) {
                                console.log(error);
                            } else {
                                console.log(`Updated employee's role`);
                                menuPromt();
                            };
                        });
                    });
                };
            });
        };
    });
};

const viewRoles = () => {
    connection.query(`SELECT role.id, role.title, role.salary, department.name AS department FROM role
    INNER JOIN department on role.department_id = department.id`, (error, data) => {
        if (error) {
            console.log(error);
        } else {
            console.table(data);
            menuPromt();
        };
    });
};

const addRole = () => {
    let allDepartments = [];
    connection.query('SELECT * FROM department', (error, data) => {
        if (error) {
            console.log(error);
        } else {
            for (let i = 0; i < data.length; i++) {
                allDepartments.push(data[i].id + '-' + data[i].name);
            };
            inquirer.prompt([
                {
                    type: 'input',
                    name: 'role',
                    message: 'What is the name of the role?'
                },
                {
                    type: 'input',
                    name: 'salary',
                    message: 'What is the salary of the role?'
                },
                {
                    type: 'list',
                    name: 'department',
                    message: 'Which department does the role belong to?',
                    choices: allDepartments
                }
            ]).then((response) => {
                connection.query(`INSERT INTO role (title, salary, department_id)
                VALUES('${response.role}', '${response.salary}', '${response.department[0]}')`, (error, data) => {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log(`Added ${response.role} to the database`)
                        menuPromt();
                    };
                });
            });
        };
    });
};

const viewDepartments = () => {
    connection.query(`SELECT department.id, department.name AS department FROM department`, (error, data) => {
        if (error) {
            console.log(error);
        } else {
            console.table(data);
            menuPromt();
        };
    });
};

const addDepartment = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'department',
            message: 'What is the name of the department?'
        }
    ]).then((response) => {
        connection.query(`INSERT INTO department (name)
        VALUES('${response.department}')`, (error, data) => {
            if (error) {
                console.log(error);
            } else {
                console.log(`Added ${response.department} to the database`)
                menuPromt();
            };
        });
    });
};
