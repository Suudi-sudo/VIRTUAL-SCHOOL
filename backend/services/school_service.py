from models import db, School


class SchoolService:
    @staticmethod
    def create_school(data, user_id):
        new_school = School(name=data['name'], created_by=user_id)
        db.session.add(new_school)
        db.session.commit()
        return new_school

    @staticmethod
    def get_school(id):
        return School.query.get_or_404(id)
    
    