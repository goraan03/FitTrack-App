export class UserAuthDto {
    public constructor(
        public id: number = 0,
        public korisnickoIme: string = '',
        public uloga: string = 'klijent',
        public ime: string = '',
        public prezime: string = ''
    ) {}
}