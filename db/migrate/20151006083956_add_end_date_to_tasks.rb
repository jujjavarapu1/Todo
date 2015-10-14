class AddEndDateToTasks < ActiveRecord::Migration
  def change
    add_column :tasks, :end_at, :timestamp
  end
end
