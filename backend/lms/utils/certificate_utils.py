from lms.models import Certificate, Student, Course


def issue_certificate(student, course):
    """
    Issue a certificate for a student who completed a course.
    Returns the certificate if created, None if already exists.
    """
    # Check if certificate already exists
    if Certificate.objects.filter(student=student, course=course).exists():
        return None
    
    # Create certificate
    certificate = Certificate.objects.create(
        student=student,
        course=course,
        teacher=course.teacher,
        code=Certificate.generate_code(course, student),
        is_valid=True
    )
    
    return certificate


