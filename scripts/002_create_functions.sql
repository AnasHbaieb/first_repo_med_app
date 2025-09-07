-- Function to automatically create first progress month when student is created
CREATE OR REPLACE FUNCTION public.create_initial_progress_month()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.progress_months (student_id, month_number, date_debut)
  VALUES (NEW.id, 1, NEW.date_inscription);
  RETURN NEW;
END;
$$;

-- Trigger to create initial progress month
DROP TRIGGER IF EXISTS on_student_created ON public.students;
CREATE TRIGGER on_student_created
  AFTER INSERT ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.create_initial_progress_month();

-- Function to handle session completion and month progression
CREATE OR REPLACE FUNCTION public.handle_session_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_month RECORD;
  next_month_number INTEGER;
BEGIN
  -- Only proceed if marking as present
  IF NEW.is_present = true AND (OLD.is_present IS NULL OR OLD.is_present = false) THEN
    -- Get current active progress month
    SELECT * INTO current_month
    FROM public.progress_months
    WHERE student_id = NEW.student_id AND is_completed = false
    ORDER BY month_number DESC
    LIMIT 1;
    
    IF current_month IS NOT NULL THEN
      -- Increment sessions completed
      UPDATE public.progress_months
      SET 
        sessions_completed = sessions_completed + 1,
        updated_at = NOW()
      WHERE id = current_month.id;
      
      -- Check if month is completed (8 sessions)
      IF current_month.sessions_completed + 1 >= 8 THEN
        -- Mark current month as completed
        UPDATE public.progress_months
        SET 
          is_completed = true,
          date_fin = NOW(),
          updated_at = NOW()
        WHERE id = current_month.id;
        
        -- Create next progress month
        next_month_number := current_month.month_number + 1;
        INSERT INTO public.progress_months (student_id, month_number, date_debut)
        VALUES (NEW.student_id, next_month_number, NOW());
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger for session completion
DROP TRIGGER IF EXISTS on_attendance_marked ON public.attendance;
CREATE TRIGGER on_attendance_marked
  AFTER INSERT OR UPDATE ON public.attendance
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_session_completion();
