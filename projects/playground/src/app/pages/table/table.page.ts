import { Component, OnDestroy, signal } from '@angular/core';
import { TableDataColumn, TableSubheader } from '../../../../../ui/src/public-api';
import { Logger } from '../../services/logger.service';

@Component({
  standalone: false,
  selector: 'app-table',
  templateUrl: './table.page.html',
  styleUrls: ['./table.page.scss'],
})
export class TablePage implements OnDestroy {
  constructor(private _logger: Logger) {}
  log = this._logger.log;

  readonly isLoading = signal<boolean>(false);
  readonly loadingProgress = signal<number>(0);

  private _loadingInterval: NodeJS.Timeout | null = null;

  onTestDataLoadingClick() {
    this._resetLoadingProgress();
    this.isLoading.set(true);
    this._loadingInterval = setInterval(() => {
      this.loadingProgress.update(v => v + 1 / (1 + Math.random()));
      if (this.loadingProgress() > 100) {
        this._resetLoadingProgress();
      }
    }, 50);
  }
  private _resetLoadingProgress() {
    this.isLoading.set(false);
    if (this._loadingInterval) {
      clearInterval(this._loadingInterval);
    }
    this.loadingProgress.set(0);
  }

  ngOnDestroy(): void {
    this._resetLoadingProgress();
  }

  readonly CSV = `Album, Year, US Peak Chart Pos
The White Stripes, 1998, -
De Stijl, 2000, -
White Blood Cells, 2001, 61
Elephant, 2003, 6
Get Behind Me Satan, 2005, 3
Icky Thump, 2007, 2
Under Great White Northern Lights, 2010, 11
Live in Mississippi, 2011, -
Live at the Gold Dollar, 2012, -
Nine Miles from the White City, 2013, -`;

  complexColumns: (TableDataColumn | TableSubheader)[] = [
    {
      header: 'A',
      children: [
        {
          header: 'B',
          dataSource: '',
        },
        {
          header: 'C',
          dataSource: '',
        },
      ],
    },
    {
      header: 'D',
      children: [
        {
          header: 'E',
          dataSource: '',
        },
        {
          header: 'F',
          children: [
            {
              header: 'G',
              dataSource: '',
            },
            {
              header: 'H',
              children: [
                {
                  header: 'I',
                  dataSource: '',
                },
                {
                  header: 'J',
                  children: [
                    {
                      header: 'K',
                      dataSource: '',
                    },
                    {
                      header: 'L',
                      children: [
                        {
                          header: 'M',
                          dataSource: '',
                        },
                        {
                          header: 'N',
                          dataSource: '',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      header: 'O',
      children: [
        {
          header: 'P',
          dataSource: '',
        },
        {
          header: 'Q',
          dataSource: '',
        },
        {
          header: 'R',
          children: [
            {
              header: 'S',
              dataSource: '',
            },
            {
              header: 'T',
              dataSource: '',
            },
          ],
        },
      ],
    },
    {
      header: 'U',
      children: [
        {
          header: 'V',
          children: [
            {
              header: 'W',
              children: [
                {
                  header: 'X',
                  dataSource: '',
                },
                {
                  header: 'Y',
                  dataSource: '',
                },
              ],
            },
            {
              header: 'Z',
              dataSource: '',
            },
          ],
        },
        {
          header: '1',
          dataSource: '',
        },
      ],
    },
  ];

  simpleColumns: (TableDataColumn | TableSubheader)[] = [
    {
      header: 'No.',
      dataSource: { type: 'autocount' },
    },
    {
      header: 'Type',
      children: [
        {
          header: 'A',
          dataSource: '',
        },
        {
          header: 'B',
          dataSource: '',
        },
        {
          header: 'C',
          dataSource: '',
        },
      ],
    },
  ];

  peopleColumns: (TableDataColumn | TableSubheader)[] = [
    {
      header: '',
      dataSource: { type: 'checkbox' },
    },
    {
      header: 'No.',
      dataSource: { type: 'autocount' },
      isRowHeader: true,
    },
    {
      header: 'Name',
      dataSource: 'name',
      isRowHeader: true,
      sortable: true,
    },
    {
      header: 'HR Info',
      children: [
        {
          header: 'Role',
          dataSource: 'role',
        },
        {
          header: 'Salary',
          dataSource: 'salary',
          template: 'salary',
        },
      ],
    },
    {
      header: 'Contact',
      children: [
        {
          header: 'Office',
          dataSource: 'office',
        },
        {
          header: 'Extn.',
          dataSource: 'extn',
        },
        {
          header: 'Email',
          dataSource: 'email',
          width: 160,
        },
      ],
    },
  ];

  fruitColumns: TableDataColumn[] = [
    {
      header: 'No.',
      dataSource: { type: 'autocount' },
    },
    {
      header: 'Fruit',
      dataSource: 'fruit',
    },
    {
      header: 'kcal/100g',
      dataSource: 'calories',
    },
    {
      header: 'Primary color',
      dataSource: 'color',
    },
    {
      header: 'Harvest season',
      dataSource: 'season',
    },
  ];

  peopleData = [
    {
      name: 'Nathanial Cordrey',
      role: 'Data Coordinator',
      salary: '$251099.38',
      office: 'Ludgeřovice',
      extn: 5635,
      email: 'ncordrey0@sbwire.com',
    },
    {
      name: 'Ashly Pawley',
      role: 'Database Administrator II',
      salary: '$1257129.43',
      office: 'Daqian',
      extn: 2478,
      email: 'apawley1@oaic.gov.au',
    },
    {
      name: 'Augustina Eastcourt',
      role: 'Social Worker',
      salary: '$952907.98',
      office: 'Formosa',
      extn: 3282,
      email: 'aeastcourt2@nbcnews.com',
    },
    {
      name: 'Amelina Bourchier',
      role: 'Human Resources Assistant III',
      salary: '$516103.64',
      office: 'El Corozo',
      extn: 5611,
      email: 'abourchier3@ed.gov',
    },
    {
      name: 'Annalise Huggill',
      role: 'Sales Representative',
      salary: '$575515.82',
      office: 'Laocheng',
      extn: 8483,
      email: 'ahuggill4@lycos.com',
    },
    {
      name: 'Hillyer De la croix',
      role: 'Financial Analyst',
      salary: '$1618393.99',
      office: 'Néa Ankhíalos',
      extn: 3379,
      email: 'hde5@dropbox.com',
    },
    {
      name: 'Maryanne Ritchings',
      role: 'Engineer III',
      salary: '$705731.86',
      office: 'Belfort',
      extn: 2313,
      email: 'mritchings6@blogs.com',
    },
    {
      name: 'Wakefield Kenningham',
      role: 'Sales Associate',
      salary: '$1023166.84',
      office: 'Karangtengah',
      extn: 2887,
      email: 'wkenningham7@cafepress.com',
    },
    {
      name: 'Darrelle Andrejevic',
      role: 'Financial Advisor',
      salary: '$616858.20',
      office: 'Huanghua',
      extn: 5623,
      email: 'dandrejevic8@instagram.com',
    },
    {
      name: 'Maddi Lewis',
      role: 'Accounting Assistant I',
      salary: '$978177.23',
      office: 'Bahía Blanca',
      extn: 8333,
      email: 'mlewis9@yale.edu',
    },
    {
      name: 'Collie Duferie',
      role: 'Nuclear Power Engineer',
      salary: '$780048.09',
      office: 'Tomelilla',
      extn: 1498,
      email: 'cduferiea@geocities.jp',
    },
    {
      name: 'Chickie Brakewell',
      role: 'Sales Associate',
      salary: '$672363.04',
      office: 'Bābolsar',
      extn: 7295,
      email: 'cbrakewellb@ucsd.edu',
    },
    {
      name: 'Edi Limerick',
      role: 'Assistant Media Planner',
      salary: '$163959.14',
      office: 'Suva Reka',
      extn: 7833,
      email: 'elimerickc@who.int',
    },
    {
      name: 'Libbey Aylen',
      role: 'Human Resources Assistant III',
      salary: '$1969157.83',
      office: 'Şirvan',
      extn: 5823,
      email: 'laylend@latimes.com',
    },
    {
      name: 'Demott Cuardall',
      role: 'Financial Analyst',
      salary: '$1895202.51',
      office: 'Huanggong',
      extn: 4009,
      email: 'dcuardalle@sohu.com',
    },
    {
      name: 'Juline Emma',
      role: 'Environmental Specialist',
      salary: '$917698.45',
      office: 'Xixia',
      extn: 1432,
      email: 'jemmaf@sitemeter.com',
    },
    {
      name: 'Vincents Jeary',
      role: 'Biostatistician III',
      salary: '$541302.03',
      office: 'Sukahening',
      extn: 7227,
      email: 'vjearyg@hc360.com',
    },
    {
      name: 'Domeniga Kobiela',
      role: 'Research Associate',
      salary: '$289112.92',
      office: 'San Isidro',
      extn: 9674,
      email: 'dkobielah@geocities.com',
    },
    {
      name: 'Cathleen Lerohan',
      role: 'Registered Nurse',
      salary: '$1982009.83',
      office: 'Munka-Ljungby',
      extn: 9241,
      email: 'clerohani@bloomberg.com',
    },
    {
      name: 'Julienne Hargrave',
      role: 'Assistant Media Planner',
      salary: '$592889.35',
      office: 'Vantaa',
      extn: 8278,
      email: 'jhargravej@squidoo.com',
    },
    {
      name: 'Elinore Morcom',
      role: 'Project Manager',
      salary: '$1757325.54',
      office: 'Kavallári',
      extn: 3933,
      email: 'emorcomk@cisco.com',
    },
    {
      name: 'Melodee Leyband',
      role: 'Paralegal',
      salary: '$918751.99',
      office: 'Empangeni',
      extn: 4423,
      email: 'mleybandl@bluehost.com',
    },
    {
      name: 'Norrie Brockton',
      role: 'Internal Auditor',
      salary: '$418062.65',
      office: 'Liuhao',
      extn: 4797,
      email: 'nbrocktonm@furl.net',
    },
    {
      name: 'Madalena Werendell',
      role: 'Media Manager IV',
      salary: '$154147.06',
      office: 'Honghai',
      extn: 9093,
      email: 'mwerendelln@netscape.com',
    },
    {
      name: 'Georgena Mennell',
      role: 'Account Coordinator',
      salary: '$1326819.33',
      office: 'Ngama',
      extn: 3242,
      email: 'gmennello@salon.com',
    },
    {
      name: 'Esme Rosson',
      role: 'Automation Specialist II',
      salary: '$501601.74',
      office: 'Guanchi',
      extn: 1450,
      email: 'erossonp@symantec.com',
    },
    {
      name: 'Nester Munday',
      role: 'Occupational Therapist',
      salary: '$999012.91',
      office: 'Pervoural’sk',
      extn: 1899,
      email: 'nmundayq@joomla.org',
    },
    {
      name: 'Wildon Berkeley',
      role: 'Social Worker',
      salary: '$1463486.87',
      office: 'Zabierzów',
      extn: 4402,
      email: 'wberkeleyr@redcross.org',
    },
    {
      name: 'Annamarie Keepe',
      role: 'Senior Developer',
      salary: '$1186463.64',
      office: 'Krasne',
      extn: 4957,
      email: 'akeepes@statcounter.com',
    },
    {
      name: 'Carissa Tomblett',
      role: 'Tax Accountant',
      salary: '$967977.02',
      office: 'Pakapasan Ilir',
      extn: 5194,
      email: 'ctomblettt@reddit.com',
    },
    {
      name: 'Margalit Prendeguest',
      role: 'GIS Technical Architect',
      salary: '$1262697.52',
      office: 'Tongjiaxi',
      extn: 9263,
      email: 'mprendeguestu@rakuten.co.jp',
    },
    {
      name: 'Kirsten Crock',
      role: 'Quality Engineer',
      salary: '$67371.65',
      office: 'Pigí',
      extn: 3004,
      email: 'kcrockv@redcross.org',
    },
    {
      name: 'Micky Axelbey',
      role: 'Accounting Assistant I',
      salary: '$569768.12',
      office: 'Ruchihe',
      extn: 1257,
      email: 'maxelbeyw@infoseek.co.jp',
    },
    {
      name: 'Armstrong Hurford',
      role: 'Budget/Accounting Analyst III',
      salary: '$1022113.23',
      office: 'Zográfos',
      extn: 4428,
      email: 'ahurfordx@fema.gov',
    },
    {
      name: 'Marius Stansfield',
      role: 'Operator',
      salary: '$956457.34',
      office: 'Mtimbira',
      extn: 9536,
      email: 'mstansfieldy@yale.edu',
    },
    {
      name: 'Marabel Kemmish',
      role: 'Registered Nurse',
      salary: '$1531055.17',
      office: 'Samsan',
      extn: 6630,
      email: 'mkemmishz@hexun.com',
    },
    {
      name: 'Erinn Cutford',
      role: 'Biostatistician II',
      salary: '$219249.41',
      office: 'Haridimun',
      extn: 2297,
      email: 'ecutford10@bizjournals.com',
    },
    {
      name: 'Reginauld Fitzhenry',
      role: 'Business Systems Development Analyst',
      salary: '$1457125.51',
      office: 'São Pedro',
      extn: 6806,
      email: 'rfitzhenry11@gmpg.org',
    },
    {
      name: 'Chelsy Volage',
      role: 'Nurse',
      salary: '$1147435.61',
      office: 'Ostrowite',
      extn: 1397,
      email: 'cvolage12@vistaprint.com',
    },
    {
      name: 'Pepillo MacDermid',
      role: 'Information Systems Manager',
      salary: '$1449376.97',
      office: 'Arlington',
      extn: 5500,
      email: 'pmacdermid13@si.edu',
    },
    {
      name: 'Oralie Mushet',
      role: 'Nuclear Power Engineer',
      salary: '$909447.96',
      office: 'Mbigou',
      extn: 7771,
      email: 'omushet14@hostgator.com',
    },
    {
      name: 'Shirlene Froschauer',
      role: 'Registered Nurse',
      salary: '$1777150.04',
      office: 'Sojo',
      extn: 1217,
      email: 'sfroschauer15@senate.gov',
    },
    {
      name: 'Gavrielle Jonathon',
      role: 'Recruiting Manager',
      salary: '$337504.51',
      office: 'Qusar',
      extn: 4065,
      email: 'gjonathon16@cocolog-nifty.com',
    },
    {
      name: 'Cristiano Easter',
      role: 'Business Systems Development Analyst',
      salary: '$880735.50',
      office: 'Toba',
      extn: 9613,
      email: 'ceaster17@wikimedia.org',
    },
    {
      name: 'Rik Crock',
      role: 'Account Coordinator',
      salary: '$835912.64',
      office: 'Pueblo Nuevo Viñas',
      extn: 8796,
      email: 'rcrock18@seesaa.net',
    },
    {
      name: 'Emogene Staniford',
      role: 'Help Desk Operator',
      salary: '$469059.90',
      office: 'Västra Frölunda',
      extn: 4666,
      email: 'estaniford19@webs.com',
    },
    {
      name: 'Aeriela Pauleit',
      role: 'Assistant Manager',
      salary: '$1303479.83',
      office: 'Pamatang',
      extn: 6107,
      email: 'apauleit1a@va.gov',
    },
    {
      name: 'Wang Fakeley',
      role: 'Human Resources Manager',
      salary: '$599650.94',
      office: 'Saint-Gaudens',
      extn: 8142,
      email: 'wfakeley1b@pinterest.com',
    },
    {
      name: 'Kaile Silcocks',
      role: 'VP Quality Control',
      salary: '$1577488.94',
      office: 'Nelson',
      extn: 677,
      email: 'ksilcocks1c@trellian.com',
    },
    {
      name: 'Dominica Jizhaki',
      role: 'Tax Accountant',
      salary: '$1439256.90',
      office: 'Guruyan',
      extn: 2767,
      email: 'djizhaki1d@homestead.com',
    },
    {
      name: 'Rozella Wellen',
      role: 'Media Manager I',
      salary: '$1030739.10',
      office: 'Akron',
      extn: 1855,
      email: 'rwellen1e@gnu.org',
    },
    {
      name: 'Hetti Hebbes',
      role: 'Analyst Programmer',
      salary: '$689432.02',
      office: 'Shuyuan Zhen',
      extn: 6792,
      email: 'hhebbes1f@prlog.org',
    },
    {
      name: 'Maressa Bushby',
      role: 'Quality Control Specialist',
      salary: '$120954.26',
      office: 'Banatski Dvor',
      extn: 8338,
      email: 'mbushby1g@amazon.de',
    },
    {
      name: 'Gayel Anthony',
      role: 'Data Coordinator',
      salary: '$475019.69',
      office: 'Qukës-Skënderbe',
      extn: 2655,
      email: 'ganthony1h@boston.com',
    },
    {
      name: 'Marcia Winley',
      role: 'Desktop Support Technician',
      salary: '$1794775.43',
      office: 'Sadananya',
      extn: 8207,
      email: 'mwinley1i@delicious.com',
    },
    {
      name: 'Laurie Meeke',
      role: 'Payment Adjustment Coordinator',
      salary: '$1414881.12',
      office: 'Itsandra',
      extn: 2131,
      email: 'lmeeke1j@gizmodo.com',
    },
    {
      name: 'Roxana Mechem',
      role: 'Senior Developer',
      salary: '$514464.70',
      office: 'Sacramento',
      extn: 3728,
      email: 'rmechem1k@admin.ch',
    },
    {
      name: 'Keri Kitchingman',
      role: 'Assistant Manager',
      salary: '$429724.28',
      office: 'Vília',
      extn: 5692,
      email: 'kkitchingman1l@vistaprint.com',
    },
    {
      name: 'Delphinia Govinlock',
      role: 'Staff Scientist',
      salary: '$1916972.08',
      office: 'Yangxiang',
      extn: 8197,
      email: 'dgovinlock1m@webs.com',
    },
    {
      name: 'Modesty Chazette',
      role: 'Administrative Officer',
      salary: '$1355259.59',
      office: 'Ngala',
      extn: 1094,
      email: 'mchazette1n@about.me',
    },
    {
      name: 'Cindelyn Camelin',
      role: 'Mechanical Systems Engineer',
      salary: '$1162770.59',
      office: 'Yamparáez',
      extn: 1268,
      email: 'ccamelin1o@gizmodo.com',
    },
    {
      name: 'Torrence Gislebert',
      role: 'Systems Administrator III',
      salary: '$1055139.11',
      office: 'Adani',
      extn: 734,
      email: 'tgislebert1p@flavors.me',
    },
    {
      name: 'Andra Moniker',
      role: 'Environmental Specialist',
      salary: '$308783.39',
      office: 'Rogóźno',
      extn: 1017,
      email: 'amoniker1q@foxnews.com',
    },
    {
      name: 'Sibylle Warton',
      role: 'Junior Executive',
      salary: '$1382212.38',
      office: 'Yankou',
      extn: 1779,
      email: 'swarton1r@bloglines.com',
    },
    {
      name: 'Kristal Tugwell',
      role: 'Mechanical Systems Engineer',
      salary: '$1011845.97',
      office: 'Descalvado',
      extn: 794,
      email: 'ktugwell1s@cargocollective.com',
    },
    {
      name: 'Kara-lynn Farryan',
      role: 'Compensation Analyst',
      salary: '$980919.60',
      office: 'Bonak',
      extn: 1887,
      email: 'kfarryan1t@i2i.jp',
    },
    {
      name: 'Wilhelmina Potzold',
      role: 'Human Resources Assistant III',
      salary: '$163879.22',
      office: 'Barisāl',
      extn: 7599,
      email: 'wpotzold1u@msn.com',
    },
    {
      name: 'Laura Dumelow',
      role: 'General Manager',
      salary: '$1913310.14',
      office: 'Mashiko',
      extn: 3522,
      email: 'ldumelow1v@webnode.com',
    },
    {
      name: 'Tessy Ferroni',
      role: 'Budget/Accounting Analyst IV',
      salary: '$904772.38',
      office: 'Yaita',
      extn: 4470,
      email: 'tferroni1w@google.ca',
    },
    {
      name: 'Appolonia McKimmey',
      role: 'Computer Systems Analyst I',
      salary: '$1757187.50',
      office: 'Yanqul',
      extn: 6477,
      email: 'amckimmey1x@squidoo.com',
    },
    {
      name: 'Ardith Dufore',
      role: 'Technical Writer',
      salary: '$890913.59',
      office: 'Zachepylivka',
      extn: 7389,
      email: 'adufore1y@soundcloud.com',
    },
    {
      name: 'Carmine Giuron',
      role: 'Staff Scientist',
      salary: '$1094474.96',
      office: 'Pitomača',
      extn: 4028,
      email: 'cgiuron1z@ow.ly',
    },
    {
      name: 'Tabbitha Causley',
      role: 'Budget/Accounting Analyst III',
      salary: '$222878.65',
      office: 'Mbinga',
      extn: 6869,
      email: 'tcausley20@mozilla.com',
    },
    {
      name: 'Shaun Grewe',
      role: 'Payment Adjustment Coordinator',
      salary: '$1768878.81',
      office: 'Dasha',
      extn: 9093,
      email: 'sgrewe21@nytimes.com',
    },
    {
      name: 'Johann Boutflour',
      role: 'Statistician I',
      salary: '$1545837.66',
      office: 'Pateh Sam',
      extn: 1250,
      email: 'jboutflour22@techcrunch.com',
    },
    {
      name: 'Leslie Middas',
      role: 'Engineer III',
      salary: '$1025579.30',
      office: 'Lugo',
      extn: 8805,
      email: 'lmiddas23@booking.com',
    },
    {
      name: 'Reggi Shorthouse',
      role: 'Sales Associate',
      salary: '$931981.86',
      office: 'Cuogang',
      extn: 1403,
      email: 'rshorthouse24@toplist.cz',
    },
    {
      name: 'Ulla Davidoff',
      role: 'Product Engineer',
      salary: '$1022579.04',
      office: 'Klippan',
      extn: 1521,
      email: 'udavidoff25@xrea.com',
    },
    {
      name: 'Jervis Pepler',
      role: 'Statistician II',
      salary: '$1036205.32',
      office: 'Alepoú',
      extn: 740,
      email: 'jpepler26@theglobeandmail.com',
    },
    {
      name: 'Ferris Yarnley',
      role: 'Internal Auditor',
      salary: '$1393488.29',
      office: 'Kuantan',
      extn: 8161,
      email: 'fyarnley27@infoseek.co.jp',
    },
    {
      name: 'Lizette Durkin',
      role: 'Operator',
      salary: '$1225932.48',
      office: 'Thị Trấn Tam Sơn',
      extn: 9752,
      email: 'ldurkin28@slate.com',
    },
    {
      name: 'Peyter Kloser',
      role: 'Biostatistician III',
      salary: '$1151382.19',
      office: 'Krynki',
      extn: 9387,
      email: 'pkloser29@spiegel.de',
    },
    {
      name: 'Josefina Margery',
      role: 'Senior Financial Analyst',
      salary: '$1892509.77',
      office: 'Cikondang',
      extn: 5914,
      email: 'jmargery2a@comcast.net',
    },
    {
      name: 'Freeman Guthrum',
      role: 'Editor',
      salary: '$1566870.49',
      office: 'Gromadka',
      extn: 8068,
      email: 'fguthrum2b@ezinearticles.com',
    },
    {
      name: 'Imojean Damerell',
      role: 'Environmental Tech',
      salary: '$1627736.58',
      office: 'Tsivil’sk',
      extn: 3171,
      email: 'idamerell2c@foxnews.com',
    },
    {
      name: "Stillmann O'Shaughnessy",
      role: 'Product Engineer',
      salary: '$1156307.79',
      office: 'Zhucun',
      extn: 7100,
      email: 'soshaughnessy2d@blog.com',
    },
    {
      name: 'Kynthia Gladwell',
      role: 'Social Worker',
      salary: '$1655796.82',
      office: 'Sugito',
      extn: 5935,
      email: 'kgladwell2e@timesonline.co.uk',
    },
    {
      name: 'Lelah Merit',
      role: 'Social Worker',
      salary: '$1374419.86',
      office: 'Visaginas',
      extn: 1173,
      email: 'lmerit2f@weather.com',
    },
    {
      name: 'Sullivan Ruos',
      role: 'Programmer I',
      salary: '$1353091.77',
      office: 'Quanjiang',
      extn: 5615,
      email: 'sruos2g@ow.ly',
    },
    {
      name: 'Jacintha Dellenbroker',
      role: 'Executive Secretary',
      salary: '$1520258.44',
      office: 'Sabang',
      extn: 2182,
      email: 'jdellenbroker2h@slate.com',
    },
    {
      name: 'Bartlett Barracks',
      role: 'Product Engineer',
      salary: '$1917427.34',
      office: 'Chaiyaphum',
      extn: 6698,
      email: 'bbarracks2i@earthlink.net',
    },
    {
      name: "Morris O'Corrin",
      role: 'Recruiter',
      salary: '$623234.87',
      office: 'Shanglu',
      extn: 577,
      email: 'mocorrin2j@quantcast.com',
    },
    {
      name: 'Ashlie Ferrarin',
      role: 'Structural Engineer',
      salary: '$1547697.51',
      office: 'Staryy Oskol',
      extn: 178,
      email: 'aferrarin2k@auda.org.au',
    },
    {
      name: 'Cob Gallichan',
      role: 'Administrative Officer',
      salary: '$1499130.38',
      office: 'Selajambe Satu',
      extn: 3410,
      email: 'cgallichan2l@ted.com',
    },
    {
      name: 'Ulla Fleeming',
      role: 'Technical Writer',
      salary: '$1326374.41',
      office: 'Bayambang',
      extn: 4219,
      email: 'ufleeming2m@uiuc.edu',
    },
    {
      name: 'Paul Alywin',
      role: 'Registered Nurse',
      salary: '$997447.68',
      office: 'Gal’bshtadt',
      extn: 4809,
      email: 'palywin2n@columbia.edu',
    },
    {
      name: 'Michell Midlane',
      role: 'VP Quality Control',
      salary: '$1021326.31',
      office: 'Xinlin',
      extn: 4830,
      email: 'mmidlane2o@t.co',
    },
    {
      name: 'Sly Doyley',
      role: 'Teacher',
      salary: '$1929088.49',
      office: 'Sovetakan',
      extn: 1839,
      email: 'sdoyley2p@cbc.ca',
    },
    {
      name: 'Constantina MacKellen',
      role: 'Community Outreach Specialist',
      salary: '$1548697.62',
      office: 'Petung',
      extn: 8859,
      email: 'cmackellen2q@taobao.com',
    },
    {
      name: 'Mata Brouncker',
      role: 'Director of Sales',
      salary: '$736959.82',
      office: 'Dalupaon',
      extn: 6079,
      email: 'mbrouncker2r@comcast.net',
    },
  ];

  fruitData = [
    { fruit: 'Apple', calories: 52, color: 'Red', season: 'Fall' },
    { fruit: 'Banana', calories: 89, color: 'Yellow', season: 'Year-round' },
    { fruit: 'Cherry', calories: 50, color: 'Red', season: 'Summer' },
    { fruit: 'Orange', calories: 47, color: 'Orange', season: 'Winter' },
    { fruit: 'Pineapple', calories: 50, color: 'Brown', season: 'Summer' },
    { fruit: 'Kiwi', calories: 61, color: 'Green', season: 'Winter' },
    { fruit: 'Grapes', calories: 69, color: 'Purple', season: 'Fall' },
    { fruit: 'Mango', calories: 60, color: 'Orange', season: 'Summer' },
    { fruit: 'Blueberry', calories: 57, color: 'Blue', season: 'Summer' },
    { fruit: 'Strawberry', calories: 32, color: 'Red', season: 'Spring' },
    { fruit: 'Peach', calories: 39, color: 'Pink', season: 'Summer' },
    { fruit: 'Pear', calories: 57, color: 'Green', season: 'Fall' },
    { fruit: 'Watermelon', calories: 30, color: 'Green', season: 'Summer' },
    { fruit: 'Papaya', calories: 43, color: 'Orange', season: 'Year-round' },
    { fruit: 'Blackberry', calories: 43, color: 'Black', season: 'Summer' },
    { fruit: 'Cantaloupe', calories: 34, color: 'Orange', season: 'Summer' },
    { fruit: 'Plum', calories: 46, color: 'Purple', season: 'Summer' },
    { fruit: 'Raspberry', calories: 52, color: 'Red', season: 'Summer' },
    { fruit: 'Lemon', calories: 29, color: 'Yellow', season: 'Winter' },
    { fruit: 'Apricot', calories: 48, color: 'Orange', season: 'Summer' },
    { fruit: 'Grapefruit', calories: 42, color: 'Pink', season: 'Winter' },
    { fruit: 'Lychee', calories: 66, color: 'Red', season: 'Summer' },
    { fruit: 'Fig', calories: 74, color: 'Purple', season: 'Summer' },
    { fruit: 'Coconut', calories: 354, color: 'Brown', season: 'Year-round' },
    { fruit: 'Avocado', calories: 160, color: 'Green', season: 'Spring' },
    { fruit: 'Pomegranate', calories: 83, color: 'Red', season: 'Fall' },
    { fruit: 'Guava', calories: 68, color: 'Green', season: 'Year-round' },
    { fruit: 'Dragonfruit', calories: 60, color: 'Pink', season: 'Summer' },
    { fruit: 'Starfruit', calories: 31, color: 'Yellow', season: 'Fall' },
    { fruit: 'Passion Fruit', calories: 97, color: 'Purple', season: 'Summer' },
  ];
}
